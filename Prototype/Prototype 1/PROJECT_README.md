# BRAILLEAR - Complete Project Architecture & Setup Guide

## 📋 Project Overview

BRAILLEAR is a Smart Touch-to-Speech Learning System for visually impaired learners. The system consists of:

1. **Hardware Layer**: Raspberry Pi Pico microcontrollers with TTP223 capacitive touch sensors
2. **Firmware Layer**: MicroPython code running on Picos
3. **Web Application**: React/TypeScript web app with Web Serial API integration

## 🏗️ System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Transmitter    │  UART   │   Receiver      │  USB    │   Web App       │
│  Pico           │────────▶│   Pico          │────────▶│   (Browser)     │
│                 │         │                 │ Serial  │                 │
│  - 26 Sensors   │         │  - UART RX      │         │  - Web Serial   │
│  - A-Z Mapping  │         │  - USB Serial   │         │  - Audio Play   │
│  - Debouncing   │         │  - LED Status   │         │  - Event Log    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Data Flow

1. **User touches sensor** → TTP223 sensor outputs HIGH
2. **Transmitter Pico** → Detects touch, debounces, sends character (A-Z) via UART
3. **Receiver Pico** → Receives UART data, forwards to USB Serial
4. **Web App** → Reads USB Serial via Web Serial API, plays audio, logs event

## 📁 Project Structure

```
Prototype 1/
├── transmitter/              # Transmitter Pico firmware
│   ├── main.py             # MicroPython firmware (reads sensors, sends UART)
│   └── README.md           # Wiring and testing instructions
│
├── receiver/               # Receiver Pico firmware
│   ├── main.py             # MicroPython firmware (receives UART, forwards USB)
│   └── README.md           # Wiring and testing instructions
│
└── workspace/
    └── shadcn-ui/          # Web application
        ├── src/
        │   ├── lib/
        │   │   ├── serialManager.ts    # Web Serial API integration
        │   │   ├── audioManager.ts     # Audio playback system
        │   │   └── auth.ts             # Authentication
        │   ├── components/
        │   │   ├── SerialPanel.tsx     # Hardware connection UI
        │   │   ├── SensorGrid.tsx      # Sensor visualization
        │   │   ├── AudioPlayer.tsx     # Audio controls
        │   │   └── EventLog.tsx        # Event logging
        │   └── pages/
        │       └── Dashboard.tsx      # Main dashboard
        └── package.json
```

## 🔌 Hardware Setup

### Components Required

- **2x Raspberry Pi Pico** (RP2040)
- **26x TTP223 Capacitive Touch Sensors**
- **Jumper wires**
- **Breadboard** (optional)
- **USB cables** (for programming and power)
- **Status LED + resistor** (220-470Ω) for receiver

### Wiring

#### Transmitter Pico
- **Sensors A-Z** → **GP0-GP25** (one sensor per GPIO)
- **UART TX** → **GP26** (connects to receiver RX)
- **All sensors VCC** → **3.3V**
- **All sensors GND** → **GND**

#### Receiver Pico
- **UART RX** → **GP27** (connects to transmitter TX)
- **Status LED** → **GP28** (via current-limiting resistor)
- **Common GND** → Connect to transmitter GND

#### UART Connection
- **Transmitter GP26 (TX)** → **Receiver GP27 (RX)**
- **Common GND** between both Picos

## 💻 Software Setup

### 1. Firmware Installation

#### Transmitter Pico
1. Flash MicroPython to Pico (download from micropython.org)
2. Upload `transmitter/main.py` to Pico as `main.py`
3. Connect sensors according to wiring diagram
4. Power on and verify REPL output

#### Receiver Pico
1. Flash MicroPython to Pico
2. Upload `receiver/main.py` to Pico as `main.py`
3. Connect UART and LED according to wiring diagram
4. Power on and verify REPL output

### 2. Web Application Setup

```bash
# Navigate to web app directory
cd workspace/shadcn-ui

# Install dependencies (requires Node.js 18+ and pnpm)
pnpm install

# Start development server
pnpm run dev
```

The app will be available at `http://localhost:5174`

### 3. Connecting Hardware to Web App

1. **Connect Receiver Pico** to computer via USB
2. **Open web app** in Chrome/Edge/Opera (Web Serial API support required)
3. **Navigate to Dashboard**
4. **Click "Connect Hardware"** button
5. **Select the Pico device** from the browser dialog
6. **Grant permissions** when prompted

## 🎯 Usage

### Demo Mode (No Hardware Required)

1. Open web app
2. Click "Start Demo Mode"
3. Click sensor buttons in the grid
4. Audio will play for each character
5. Events are logged in the Event Log

### Hardware Mode

1. Ensure transmitter and receiver Picos are powered and connected
2. Connect receiver Pico to computer via USB
3. Open web app and connect hardware
4. Touch physical sensors on transmitter
5. Audio plays automatically in web app
6. Events are logged with timestamps

## 🔧 Configuration

### Firmware Configuration

Edit constants in `transmitter/main.py` and `receiver/main.py`:

```python
BAUD = 9600              # UART baudrate
DEBOUNCE_MS = 40         # Debounce period
LOCKOUT_MS = 300         # Retrigger prevention
UART_TX_PIN = 26        # Transmitter TX pin
UART_RX_PIN = 27        # Receiver RX pin
STATUS_LED_PIN = 28     # Receiver LED pin
```

### Web App Configuration

Serial settings in `serialManager.ts`:
- Baud Rate: 9600 (must match firmware)
- Data Bits: 8
- Stop Bits: 1
- Parity: None

Audio settings in `audioManager.ts`:
- Default Volume: 0.7 (0-1 range)
- Audio Context: Auto-initialized on user interaction

## 🧪 Testing

### Unit Testing

1. **Transmitter Test**: Touch each sensor A-Z, verify REPL output
2. **Receiver Test**: Verify LED toggles on character reception
3. **UART Test**: Verify characters transmitted correctly
4. **Web App Test**: Connect hardware, verify character reception

### Integration Testing

1. **End-to-End**: Touch sensor → Verify audio plays in web app
2. **Latency Test**: Measure touch-to-audio delay (target <200ms)
3. **Debounce Test**: Rapid tapping should not cause duplicates
4. **Lockout Test**: Same sensor should not retrigger within 300ms

## 🐛 Troubleshooting

### Firmware Issues

**Problem**: No output in REPL
- Check sensor power connections (VCC to 3.3V, GND to GND)
- Verify GPIO pin connections
- Check pull resistor configuration (PULL_DOWN vs PULL_UP)

**Problem**: UART not working
- Verify TX/RX pin connections
- Check common GND between Picos
- Verify baudrate matches (9600)

### Web App Issues

**Problem**: Web Serial API not available
- Use Chrome, Edge, or Opera browser
- Ensure HTTPS or localhost (required for Web Serial API)
- Check browser permissions

**Problem**: No characters received
- Verify receiver Pico is connected via USB
- Check receiver firmware is running
- Verify UART connection between Picos
- Check browser console for errors

**Problem**: Audio not playing
- Click anywhere on page to initialize AudioContext
- Check browser audio permissions
- Verify volume settings

## 📊 System Specifications

- **Latency**: <200ms touch-to-audio
- **Debounce**: 40ms stable period
- **Lockout**: 300ms retrigger prevention
- **Baud Rate**: 9600
- **Character Set**: A-Z (26 letters)
- **Sensor Count**: 26 TTP223 capacitive sensors

## 🔄 Development Workflow

1. **Edit firmware** → Upload to Pico → Test with REPL
2. **Edit web app** → Save → Auto-reload in browser
3. **Test integration** → Connect hardware → Verify end-to-end flow
4. **Debug** → Check browser console and REPL output

## 📚 Additional Resources

- [MicroPython Documentation](https://docs.micropython.org/)
- [Web Serial API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Raspberry Pi Pico Pinout](https://datasheets.raspberrypi.com/pico/pico-pinout.pdf)
- [TTP223 Datasheet](https://www.digikey.com/en/datasheets/diodes-incorporated/diodes-incorporated-ttp223)

## 🚀 Next Steps

1. **Add number sensors** (0-9) to transmitter firmware
2. **Implement audio file playback** (replace synthetic tones)
3. **Add progress tracking** and learning analytics
4. **Implement Bluetooth connectivity** (ESP32 alternative)
5. **Add mobile app** support (React Native)

---

**BRAILLEAR** - Empowering visually impaired learners through technology-driven inclusivity.

