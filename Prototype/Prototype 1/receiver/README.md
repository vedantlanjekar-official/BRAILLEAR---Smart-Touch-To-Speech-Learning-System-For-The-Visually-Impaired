# BRAILLEAR Receiver Firmware

MicroPython firmware for Raspberry Pi Pico that receives characters (A-Z) over UART from the transmitter and displays them via REPL output and status LED.

## Hardware Requirements

- Raspberry Pi Pico (RP2040)
- 1 × Status LED (standard LED, 2-3.3V forward voltage)
- 1 × Current-limiting resistor (220-470Ω recommended)
- Jumper wires
- USB cable for power and programming

## Wiring Diagram

### UART Connections (from Transmitter)
- **Transmitter Pico GP26 (TX)** → **Receiver Pico GP27 (RX)**
- **Transmitter Pico GND** → **Receiver Pico GND** (common ground required)

### Status LED Connection
- **LED Anode (+)** → **Current-limiting resistor (220Ω)** → **Pico GP28**
- **LED Cathode (-)** → **Pico GND**

**Note**: If GP28 is not available on your Pico, change `STATUS_LED_PIN = 28` to another spare pin (e.g., GP25) in `main.py`.

### Pin Reference
- **GP27 (RX)**: Pin 32 (UART0 RX)
- **GP28 (LED)**: Pin 34 (if available, otherwise use GP25 or another spare)
- **GND**: Any GND pin (e.g., pin 38)

## Installation

1. **Install MicroPython** on your Pico:
   - Download latest MicroPython UF2 from [micropython.org](https://micropython.org/download/rp2-pico/)
   - Hold BOOTSEL button on Pico, connect USB, release BOOTSEL
   - Copy UF2 file to mounted drive

2. **Upload Firmware**:
   - Open Thonny IDE (or your preferred MicroPython editor)
   - Connect to Pico via USB
   - Open `receiver/main.py` and save it to the Pico as `main.py`

3. **Verify Connection**:
   - Check REPL output for initialization messages
   - Run test mode to verify LED toggling

## Configuration

Edit constants at the top of `main.py` if needed:

```python
BAUD = 9600           # UART baudrate (must match transmitter)
UART_RX_PIN = 27     # UART receive pin (must match transmitter TX)
STATUS_LED_PIN = 28  # Status LED pin (change if GP28 unavailable)
```

## Testing

### Unit Test Steps

1. **Power Up**:
   - Connect receiver Pico to USB
   - Connect transmitter Pico to USB (separate port)
   - Connect UART: Transmitter GP26 (TX) → Receiver GP27 (RX)
   - Connect common GND between both Picos

2. **Test Reception**:
   - Touch sensor A on transmitter
   - **Expected**: Receiver REPL shows `[timestamp] Received: A`
   - **Expected**: Status LED toggles (changes state)

3. **Test Multiple Characters**:
   - Touch sensors A, B, C on transmitter in sequence
   - **Expected**: Receiver prints each letter with timestamp
   - **Expected**: LED toggles for each received character

4. **Test All Letters**:
   - Touch each sensor A-Z on transmitter
   - **Expected**: Receiver prints all 26 letters correctly

5. **Test Mode** (Software):
   - On startup, firmware runs `test_mode()` which simulates receiving A, B, C, Z
   - Useful for testing LED and output without transmitter hardware

### Troubleshooting

**Problem**: No characters received
- **Check**: UART wiring (TX to RX, RX to TX)
- **Check**: Common GND between transmitter and receiver
- **Check**: Transmitter firmware is running
- **Check**: Baudrate matches (9600 on both)
- **Check**: UART pins match (GP26/GP27)

**Problem**: LED doesn't toggle
- **Check**: LED wiring (anode → resistor → GP28, cathode → GND)
- **Check**: Resistor value (220-470Ω recommended)
- **Check**: LED polarity (anode/cathode correct)
- **Check**: `STATUS_LED_PIN` constant matches your wiring
- **Check**: LED forward voltage (should work with 3.3V)

**Problem**: Garbled characters or wrong letters
- **Check**: UART baudrate matches transmitter (9600)
- **Check**: Wiring connections are solid
- **Check**: No interference on UART lines (keep wires short)

**Problem**: Characters received but not printed
- **Check**: REPL connection (Thonny connected to correct port)
- **Check**: Non A-Z characters are ignored (expected behavior)
- **Check**: Newline characters are filtered (expected behavior)

**Problem**: Syntax errors in MicroPython
- **Check**: Using MicroPython (not CircuitPython or other variants)
- **Check**: File saved as `main.py` on Pico (not on host PC)

## Code Structure

- **UART Reception**: Polls UART buffer for incoming bytes
- **Character Validation**: Only processes A-Z (ASCII 65-90)
- **LED Toggle**: Toggles status LED on each valid character
- **Timestamp Logging**: Prints received characters with millisecond timestamps
- **Error Handling**: Catches UART read failures, continues operation

## Memory Usage

- Minimal memory footprint
- Small receive buffer (32 bytes)
- No external dependencies beyond MicroPython standard library

## Extending to Per-Letter Outputs

To drive separate LEDs or outputs for each letter:

1. **Define output pins** for each letter (A-Z):
   ```python
   OUTPUT_PINS = {
       'A': Pin(2, Pin.OUT),
       'B': Pin(3, Pin.OUT),
       # ... etc
   }
   ```

2. **Modify `process_received_char()`**:
   ```python
   def process_received_char(char_byte):
       if is_valid_letter(char_byte):
           char = chr(char_byte)
           if char in OUTPUT_PINS:
               OUTPUT_PINS[char].value(1)  # Turn on letter-specific LED
               # ... turn off after delay or on next letter
   ```

3. **Add timing logic** to turn off previous letter's output when new letter arrives.

## Future Extensions

- Add character history buffer
- Add per-letter statistics
- Add serial command interface for configuration
- Add buzzer/audio feedback per letter
- Add display output (OLED/LCD) for received text



