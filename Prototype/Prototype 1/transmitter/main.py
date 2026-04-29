"""
BRAILLEAR Transmitter Firmware
MicroPython for Raspberry Pi Pico (RP2040)

References: BRAILLEAR design spec and tech stack

This firmware reads 26 TTP223 capacitive touch sensors mapped to letters A-Z,
implements debouncing and interrupt-driven detection, and transmits detected
characters over UART to a receiver Pico.

Changelog:
- v1.0: Initial implementation with interrupt-driven sensor reading,
        debouncing, lockout, and UART transmission
"""

from machine import Pin, UART
import utime
import sys

# ============================================================================
# CONFIGURATION CONSTANTS
# ============================================================================

# UART Configuration
BAUD = 9600
UART_TX_PIN = 26  # GP26 for TX (avoids conflict with sensor pins GP0-GP25)
UART_RX_PIN = 27  # GP27 for RX (not used in transmitter, but defined for consistency)

# Debounce and Lockout Configuration
DEBOUNCE_MS = 40      # Stable period required before accepting touch (25-50ms range)
LOCKOUT_MS = 300      # Time before same sensor can retrigger after sending

# Sensor Pin Mapping: A→GP0, B→GP1, ..., Z→GP25
# TTP223 outputs HIGH (3.3V) when touched
SENSOR_PINS = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7,
    'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15,
    'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22,
    'X': 23, 'Y': 24, 'Z': 25
}

# ============================================================================
# ASSUMPTIONS
# ============================================================================
# 1. TTP223 outputs HIGH (3.3V logic) when touched, LOW when not touched
# 2. Using internal PULL_DOWN resistors on Pico inputs
#    (If your wiring uses pull-ups, change Pin.PULL_DOWN to Pin.PULL_UP below)
# 3. UART pins GP26 (TX) and GP27 (RX) are used to avoid conflicts with
#    sensor pins GP0-GP25
# 4. All sensors share common VCC (3.3V) and GND connections

# ============================================================================
# GLOBAL STATE
# ============================================================================

uart = None
sensor_handlers = {}
last_send_time = {}  # Track last transmission time per sensor
sensor_states = {}    # Track current debounced state per sensor
debounce_timers = {}  # Track debounce timer start per sensor

# ============================================================================
# SENSOR HANDLER CLASS
# ============================================================================

class SensorHandler:
    """
    Handles individual TTP223 sensor with debouncing and interrupt-driven detection.
    """
    
    def __init__(self, letter, pin_num):
        self.letter = letter
        self.pin_num = pin_num
        self.pin = Pin(pin_num, Pin.IN, Pin.PULL_DOWN)
        self.last_state = self.pin.value()
        self.debounce_start = None
        self.locked_until = 0
        
        # Attach interrupt handler
        self.pin.irq(trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING, handler=self._irq_handler)
    
    def _irq_handler(self, pin):
        """
        Interrupt handler called on pin state change.
        Starts debounce timer if state is HIGH.
        """
        current_state = pin.value()
        current_time = utime.ticks_ms()
        
        if current_state == 1:  # Rising edge (touch detected)
            if self.debounce_start is None:
                self.debounce_start = current_time
        else:  # Falling edge (release)
            self.debounce_start = None
    
    def check_and_send(self):
        """
        Check if sensor has been stably touched (debounced) and send if valid.
        Returns True if character was sent, False otherwise.
        """
        current_time = utime.ticks_ms()
        current_state = self.pin.value()
        
        # Check lockout period
        if current_time < self.locked_until:
            return False
        
        # Check if we're in debounce period
        if current_state == 1 and self.debounce_start is not None:
            elapsed = utime.ticks_diff(current_time, self.debounce_start)
            if elapsed >= DEBOUNCE_MS:
                # Debounce period passed, verify state is still HIGH
                if self.pin.value() == 1:
                    # Valid touch confirmed - send character
                    self._send_character()
                    self.debounce_start = None
                    self.locked_until = current_time + LOCKOUT_MS
                    return True
        
        return False
    
    def _send_character(self):
        """
        Send the character over UART and log to REPL.
        """
        char_byte = self.letter.encode('ascii')
        timestamp = utime.ticks_ms()
        
        try:
            uart.write(char_byte)
            uart.write(b'\n')  # Optional end marker for easier parsing
            print(f"[{timestamp}ms] Sent: {self.letter} (GP{self.pin_num})")
        except Exception as e:
            print(f"[{timestamp}ms] ERROR sending {self.letter}: {e}")

# ============================================================================
# INITIALIZATION
# ============================================================================

def init_uart():
    """Initialize UART0 with specified pins and baudrate."""
    global uart
    try:
        # Use UART1 to avoid conflict with default UART0 pins
        # UART1: TX=GP4, RX=GP5 (but we'll use GP26/GP27 explicitly)
        # Actually, we can use UART0 with custom pins on Pico
        uart = UART(0, BAUD, tx=Pin(UART_TX_PIN), rx=Pin(UART_RX_PIN))
        print(f"UART initialized: {BAUD} baud, TX=GP{UART_TX_PIN}, RX=GP{UART_RX_PIN}")
    except Exception as e:
        print(f"ERROR initializing UART: {e}")
        sys.exit(1)

def init_sensors():
    """Initialize all 26 sensor handlers."""
    global sensor_handlers
    for letter, pin_num in SENSOR_PINS.items():
        sensor_handlers[letter] = SensorHandler(letter, pin_num)
        last_send_time[letter] = 0
        sensor_states[letter] = 0
        debounce_timers[letter] = None
    print(f"Initialized {len(sensor_handlers)} sensors (A-Z)")

def test_mode():
    """
    Test routine: simulate touches by checking pin states and printing.
    Useful for hardware validation without actual touches.
    """
    print("\n=== TEST MODE: Checking sensor pin states ===")
    for letter, handler in sorted(sensor_handlers.items()):
        state = handler.pin.value()
        print(f"  {letter} (GP{handler.pin_num}): {'HIGH' if state else 'LOW'}")
    print("=== End test mode ===\n")

# ============================================================================
# MAIN LOOP
# ============================================================================

def main():
    """Main execution loop: continuously check sensors and handle touches."""
    print("\n" + "="*50)
    print("BRAILLEAR Transmitter Firmware v1.0")
    print("="*50)
    print(f"Config: DEBOUNCE={DEBOUNCE_MS}ms, LOCKOUT={LOCKOUT_MS}ms")
    print(f"UART: {BAUD} baud on GP{UART_TX_PIN} (TX)")
    print("="*50 + "\n")
    
    init_uart()
    init_sensors()
    
    # Run test mode once on startup
    test_mode()
    
    print("Monitoring sensors... (Press Ctrl+C to stop)\n")
    
    try:
        while True:
            # Poll all sensors to check debounced state
            for letter, handler in sensor_handlers.items():
                handler.check_and_send()
            
            # Small delay to prevent CPU spinning
            utime.sleep_ms(5)
    
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        # Cleanup: disable interrupts
        for handler in sensor_handlers.values():
            handler.pin.irq(handler=None)
        print("Transmitter stopped.")

# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    main()



