# BRAILLEAR Transmitter Firmware

MicroPython firmware for Raspberry Pi Pico that reads 26 TTP223 capacitive touch sensors and transmits detected characters (A-Z) over UART.

## Hardware Requirements

- Raspberry Pi Pico (RP2040)
- 26 × TTP223 capacitive touch sensors
- Jumper wires
- Breadboard (optional, for prototyping)
- USB cable for power and programming

## Wiring Diagram

### Power Connections (All Sensors)
- **TTP223 VCC** → **Pico 3.3V** (pin 36)
- **TTP223 GND** → **Pico GND** (any GND pin, e.g., pin 38)

### Sensor Output Connections (A-Z Mapping)
Each TTP223 OUT pin connects to the corresponding Pico GPIO pin:

| Letter | TTP223 OUT | Pico GPIO | Pico Pin # |
|--------|------------|-----------|------------|
| A      | OUT        | GP0       | 1          |
| B      | OUT        | GP1       | 2          |
| C      | OUT        | GP2       | 4          |
| D      | OUT        | GP3       | 5          |
| E      | OUT        | GP4       | 6          |
| F      | OUT        | GP5       | 7          |
| G      | OUT        | GP6       | 9          |
| H      | OUT        | GP7       | 10         |
| I      | OUT        | GP8       | 11         |
| J      | OUT        | GP9       | 12         |
| K      | OUT        | GP10      | 14         |
| L      | OUT        | GP11      | 15         |
| M      | OUT        | GP12      | 16         |
| N      | OUT        | GP13      | 17         |
| O      | OUT        | GP14      | 19         |
| P      | OUT        | GP15      | 20         |
| Q      | OUT        | GP16      | 21         |
| R      | OUT        | GP17      | 22         |
| S      | OUT        | GP18      | 24         |
| T      | OUT        | GP19      | 25         |
| U      | OUT        | GP20      | 26         |
| V      | OUT        | GP21      | 27         |
| W      | OUT        | GP22      | 29         |
| X      | OUT        | GP23      | 34         |
| Y      | OUT        | GP24      | 35         |
| Z      | OUT        | GP25      | 37         |

### UART Connections (to Receiver)
- **Pico GP26 (TX)** → **Receiver Pico GP27 (RX)**
- **Pico GND** → **Receiver Pico GND** (common ground required)

## TTP223 Sensor Behavior

- **Output**: Digital HIGH (3.3V) when touched, LOW (0V) when not touched
- **Logic Level**: 3.3V compatible (safe for Pico inputs)
- **Pull Resistor**: Firmware uses internal **PULL_DOWN** resistors
  - If your wiring uses external pull-ups, change `Pin.PULL_DOWN` to `Pin.PULL_UP` in `main.py`

## Installation

1. **Install MicroPython** on your Pico:
   - Download latest MicroPython UF2 from [micropython.org](https://micropython.org/download/rp2-pico/)
   - Hold BOOTSEL button on Pico, connect USB, release BOOTSEL
   - Copy UF2 file to mounted drive

2. **Upload Firmware**:
   - Open Thonny IDE (or your preferred MicroPython editor)
   - Connect to Pico via USB
   - Open `transmitter/main.py` and save it to the Pico as `main.py`

3. **Verify Connection**:
   - Check REPL output for initialization messages
   - Run test mode to verify sensor pin states

## Configuration

Edit constants at the top of `main.py` if needed:

```python
DEBOUNCE_MS = 40      # Debounce period (25-50ms recommended)
LOCKOUT_MS = 300      # Retrigger prevention period
UART_TX_PIN = 26      # UART transmit pin
BAUD = 9600           # UART baudrate
```

## Testing

### Unit Test Steps

1. **Power Up**:
   - Connect transmitter Pico to USB
   - Connect receiver Pico to USB (separate port)
   - Connect UART TX (GP26) to receiver RX (GP27)
   - Connect common GND between both Picos

2. **Test Single Sensor**:
   - Touch sensor A (connected to GP0)
   - **Expected**: Transmitter REPL shows `[timestamp] Sent: A (GP0)`
   - **Expected**: Receiver REPL shows `[timestamp] Received: A`

3. **Test Debouncing**:
   - Rapidly tap sensor A multiple times
   - **Expected**: Only one transmission per touch, with 300ms lockout between same sensor

4. **Test All Sensors**:
   - Touch each sensor A-Z once
   - **Expected**: Each touch sends correct letter, receiver prints each letter

5. **Test Mode** (Software):
   - On startup, firmware runs `test_mode()` which prints all sensor pin states
   - Useful for verifying wiring without touching sensors

### Troubleshooting

**Problem**: No output in REPL when touching sensors
- **Check**: Sensor power (VCC to 3.3V, GND to GND)
- **Check**: Sensor OUT connected to correct GPIO pin
- **Check**: REPL connection (Thonny connected to correct port)
- **Check**: Pin state in test mode (should show HIGH when touched)

**Problem**: Multiple duplicate transmissions
- **Solution**: Increase `DEBOUNCE_MS` (try 50ms)
- **Solution**: Increase `LOCKOUT_MS` (try 500ms)

**Problem**: Floating pins / erratic behavior
- **Check**: Pull resistor configuration (PULL_DOWN vs PULL_UP)
- **Check**: GND connections are solid
- **Check**: Sensor outputs are 3.3V logic (not 5V)

**Problem**: UART transmission fails
- **Check**: TX pin (GP26) connected to receiver RX
- **Check**: Common GND between transmitter and receiver
- **Check**: Receiver firmware is running and listening

**Problem**: Syntax errors in MicroPython
- **Check**: Using MicroPython (not CircuitPython or other variants)
- **Check**: File saved as `main.py` on Pico (not on host PC)

## Code Structure

- **SensorHandler class**: Manages individual sensor with interrupt-driven detection
- **Debouncing**: 40ms stable HIGH period required before transmission
- **Lockout**: 300ms period prevents retriggering same sensor
- **UART**: Sends ASCII character + newline marker for parsing
- **Error handling**: Catches UART write failures, logs to REPL

## Memory Usage

- Minimal memory footprint
- No external dependencies beyond MicroPython standard library
- Interrupt-driven design minimizes CPU usage

## Future Extensions

- Add per-sensor LED feedback
- Add configuration via serial commands
- Add sensor calibration mode
- Add statistics logging (touch counts per sensor)

