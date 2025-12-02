"""
BRAILLEAR Receiver Firmware
MicroPython for Raspberry Pi Pico (RP2040)

References: BRAILLEAR design spec and tech stack

This firmware listens on UART for incoming characters (A-Z) from the transmitter,
prints received characters to REPL, and toggles a status LED for each received
character.

Changelog:
- v1.0: Initial implementation with UART reception, character parsing,
        LED toggling, and timestamp logging
"""

from machine import Pin, UART
import utime
import sys

# ============================================================================
# CONFIGURATION CONSTANTS
# ============================================================================

# UART Configuration
BAUD = 9600
UART_TX_PIN = 26  # GP26 for TX (not used in receiver, but defined for consistency)
UART_RX_PIN = 27  # GP27 for RX (receives data from transmitter)

# Status LED Configuration
STATUS_LED_PIN = 28  # GP28 for status LED (safe spare pin, avoids GP0-GP27)
# Note: If GP28 is not available, use GP25 or another spare pin
# Pico has GP0-GP28 exposed; GP28 is chosen as it's least likely to conflict

# Buffer Configuration
RECV_BUFFER_SIZE = 32  # Small buffer for incoming characters

# ============================================================================
# ASSUMPTIONS
# ============================================================================
# 1. UART pins GP26 (TX) and GP27 (RX) match transmitter configuration
# 2. Status LED is connected to GP28 with appropriate current-limiting resistor
#    (220-470 ohm recommended for standard LEDs at 3.3V)
# 3. Incoming data format: ASCII characters A-Z followed by optional '\n'
# 4. Non A-Z characters are ignored

# ============================================================================
# GLOBAL STATE
# ============================================================================

uart = None
status_led = None
receive_buffer = bytearray(RECV_BUFFER_SIZE)
buffer_index = 0

# ============================================================================
# INITIALIZATION
# ============================================================================

def init_uart():
    """Initialize UART0 with specified pins and baudrate."""
    global uart
    try:
        # Use UART0 with custom pins to match transmitter
        uart = UART(0, BAUD, tx=Pin(UART_TX_PIN), rx=Pin(UART_RX_PIN))
        print(f"UART initialized: {BAUD} baud, TX=GP{UART_TX_PIN}, RX=GP{UART_RX_PIN}")
    except Exception as e:
        print(f"ERROR initializing UART: {e}")
        sys.exit(1)

def init_status_led():
    """Initialize status LED pin as output."""
    global status_led
    try:
        status_led = Pin(STATUS_LED_PIN, Pin.OUT)
        status_led.value(0)  # Start with LED off
        print(f"Status LED initialized on GP{STATUS_LED_PIN}")
    except Exception as e:
        print(f"ERROR initializing LED: {e}")
        # Continue without LED if pin unavailable
        status_led = None

def is_valid_letter(byte_val):
    """
    Check if byte represents a valid letter A-Z.
    Returns True if byte is in range b'A' (65) to b'Z' (90).
    """
    return 65 <= byte_val <= 90

def toggle_status_led():
    """Toggle the status LED state."""
    if status_led is not None:
        status_led.value(1 - status_led.value())

def process_received_char(char_byte):
    """
    Process a received character byte.
    Prints to REPL and toggles LED if valid A-Z.
    """
    if is_valid_letter(char_byte):
        char = chr(char_byte)
        timestamp = utime.ticks_ms()
        print(f"[{timestamp}ms] Received: {char}")
        toggle_status_led()
        return True
    return False

def read_uart_data():
    """
    Read available data from UART buffer.
    Processes complete characters and handles newline markers.
    """
    global buffer_index
    
    if uart.any():
        try:
            # Read available bytes
            data = uart.read(uart.any())
            if data:
                for byte_val in data:
                    # Skip newline/whitespace characters
                    if byte_val == ord('\n') or byte_val == ord('\r'):
                        continue
                    
                    # Process valid letters
                    if is_valid_letter(byte_val):
                        process_received_char(byte_val)
                    # Ignore other characters silently
        except Exception as e:
            print(f"ERROR reading UART: {e}")

def test_mode():
    """
    Test routine: simulate receiving characters to test LED and output.
    Useful for validating receiver behavior without transmitter hardware.
    """
    print("\n=== TEST MODE: Simulating received characters ===")
    test_chars = ['A', 'B', 'C', 'Z']
    for char in test_chars:
        char_byte = ord(char)
        process_received_char(char_byte)
        utime.sleep_ms(500)  # Delay between test chars
    print("=== End test mode ===\n")

# ============================================================================
# MAIN LOOP
# ============================================================================

def main():
    """Main execution loop: continuously read UART and process characters."""
    print("\n" + "="*50)
    print("BRAILLEAR Receiver Firmware v1.0")
    print("="*50)
    print(f"UART: {BAUD} baud on GP{UART_RX_PIN} (RX)")
    print(f"Status LED: GP{STATUS_LED_PIN}")
    print("="*50 + "\n")
    
    init_uart()
    init_status_led()
    
    # Run test mode once on startup
    test_mode()
    
    print("Listening for characters... (Press Ctrl+C to stop)\n")
    
    try:
        while True:
            # Check for incoming UART data
            read_uart_data()
            
            # Small delay to prevent CPU spinning
            utime.sleep_ms(10)
    
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        if status_led is not None:
            status_led.value(0)  # Turn off LED
        print("Receiver stopped.")

# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    main()

