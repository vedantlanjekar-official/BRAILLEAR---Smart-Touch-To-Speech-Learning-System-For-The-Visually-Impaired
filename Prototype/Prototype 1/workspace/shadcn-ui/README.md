# BRAILLEAR - Smart Touch-to-Speech Learning System

A revolutionary web application for Braille education that combines embedded hardware with real-time audio feedback to empower visually impaired learners.

## 🌟 Features

### Core Functionality
- **Touch-Based Learning**: TTP223 capacitive sensors mapped to A-Z and 0-9
- **Real-Time Audio Feedback**: <200ms latency for immediate phonetic response
- **Hardware Integration**: Web Serial API support for Raspberry Pi Pico
- **Demo Mode**: Comprehensive simulation for testing without hardware
- **Accessible Design**: WCAG compliant with ARIA labels and keyboard navigation

### Web Application
- **Landing Page**: Project overview with accessibility focus
- **Authentication**: Email/password login with JWT simulation
- **Dashboard**: Main interface with hardware status and controls
- **Sensor Grid**: Visual representation of 36 sensors (26 letters + 10 numbers)
- **Event Logging**: Timestamped activity tracking with export functionality
- **Audio Controls**: Volume management and playback settings
- **Settings Panel**: User preferences and hardware configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Modern browser with Web Serial API support (Chrome, Edge, Opera)
- Optional: BRAILLEAR hardware device

### Installation

```bash
# Clone the repository
git clone https://github.com/braillear/webapp.git
cd braillear-webapp

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Demo Mode
1. Open http://localhost:5174
2. Sign in with any email/password combination
3. Navigate to Dashboard
4. Click "Start Demo Mode"
5. Click sensor buttons or enable auto-play to simulate events

### Hardware Connection
1. Connect your Raspberry Pi Pico with BRAILLEAR firmware
2. Click "Connect Hardware" in the dashboard
3. Grant serial port permissions when prompted
4. Touch physical sensors to trigger audio feedback

## 🔧 Hardware Setup

### Required Components
- Raspberry Pi Pico (RP2040)
- 36x TTP223 Capacitive Touch Sensors
- 3.7V-5V Rechargeable Battery
- Type-C Charging Module
- Jumper wires and breadboard

### Firmware Installation
1. Flash MicroPython firmware to Raspberry Pi Pico
2. Upload BRAILLEAR sensor code (see `/hardware` directory)
3. Configure GPIO pins for sensors A-Z (pins 0-25) and 0-9 (pins 26-35)
4. Set UART communication at 9600 baud rate

### Wiring Diagram
```
Raspberry Pi Pico    TTP223 Sensors
GPIO 0-25       →    Sensors A-Z
GPIO 26-35      →    Sensors 0-9
3.3V            →    VCC (all sensors)
GND             →    GND (all sensors)
UART TX/RX      →    USB Serial connection
```

## 🎵 Audio System

### Demo Audio
The system generates synthetic tones for demonstration. Each character produces a unique frequency-based sound.

### Production Audio
Replace demo audio with recorded phonetic files:

```bash
# Add audio files to public/audio/
public/audio/A.mp3  # Letter A pronunciation
public/audio/B.mp3  # Letter B pronunciation
...
public/audio/0.mp3  # Number 0 pronunciation
public/audio/9.mp3  # Number 9 pronunciation
```

### Audio Specifications
- Format: MP3 or WAV
- Duration: ~500ms per file
- Sample Rate: 44.1kHz
- Normalized volume levels

## 🔌 Web Serial API

### Browser Support
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

### Permissions
The Web Serial API requires user gesture and explicit permission:
1. User clicks "Connect Hardware"
2. Browser shows device selection dialog
3. User selects Raspberry Pi Pico device

### Fallback Options
For unsupported browsers:
- Use Demo Mode for full functionality simulation
- Backend bridge via POST /api/serial/connect (future implementation)
- Python PySerial bridge script (see `/scripts` directory)

## 🎯 Accessibility Features

### WCAG Compliance
- **High Contrast**: Professional navy/teal color scheme
- **Large Touch Targets**: Minimum 44x44px interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Focus Management**: Clear focus indicators and logical tab order

### Assistive Technology
- **Screen Reader Announcements**: Real-time audio playback notifications
- **Keyboard Shortcuts**: Quick access to main functions
- **Voice Feedback**: Audio confirmation for all interactions
- **Customizable Settings**: Volume, contrast, and text size adjustments

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern UI framework with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Vite**: Fast build tool and dev server

### Audio Management
- **Web Audio API**: Low-latency audio playback
- **AudioContext**: Real-time audio processing
- **Synthetic Audio**: Demo mode tone generation
- **Volume Control**: User-configurable audio levels

### Hardware Communication
- **Web Serial API**: Direct browser-to-device communication
- **UART Protocol**: 9600 baud serial communication
- **Event-Driven**: Interrupt-based sensor detection
- **Real-Time**: <200ms touch-to-audio latency

## 📱 Deployment

### Build for Production

```bash
# Build optimized production bundle
pnpm run build

# Preview production build
pnpm run preview
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

```bash
# .env.production
VITE_API_BASE_URL=https://api.braillear.org
VITE_WS_URL=wss://ws.braillear.org
VITE_SENTRY_DSN=your-sentry-dsn
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage
```

### E2E Tests
```bash
# Run end-to-end tests
pnpm run test:e2e
```

### Accessibility Testing
```bash
# Run accessibility audits
pnpm run test:a11y
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `pnpm install`
4. Start dev server: `pnpm run dev`
5. Make changes and test thoroughly
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

### Testing Requirements
- Unit tests for all utility functions
- Integration tests for hardware communication
- Accessibility tests for all components
- E2E tests for critical user flows

## 📋 API Reference

### Serial Manager
```typescript
// Connect to hardware
await serialManager.connectToHardware();

// Start demo mode
serialManager.startDemo(autoPlay: boolean, interval: number);

// Listen for events
serialManager.onEvent((event: SerialEvent) => {
  console.log(`Character ${event.character} from ${event.source}`);
});
```

### Audio Manager
```typescript
// Play character audio
await audioManager.playCharacter('A');

// Set volume (0-1)
audioManager.setVolume(0.7);

// Get current volume
const volume = audioManager.getVolume();
```

### Auth Manager
```typescript
// Login user
const result = await authManager.login({
  email: 'user@example.com',
  password: 'password',
  rememberMe: true
});

// Update preferences
authManager.updatePreferences({
  audioVolume: 0.8,
  demoMode: true
});
```

## 🔧 Configuration

### Audio Settings
```typescript
// Audio configuration in audioManager.ts
const audioConfig = {
  sampleRate: 44100,
  bufferSize: 256,
  maxLatency: 200, // milliseconds
  defaultVolume: 0.7
};
```

### Serial Settings
```typescript
// Serial configuration in serialManager.ts
const serialConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none'
};
```

## 📚 Documentation

### User Guides
- [Getting Started Guide](docs/getting-started.md)
- [Hardware Setup Guide](docs/hardware-setup.md)
- [Accessibility Guide](docs/accessibility.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Developer Docs
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Architecture Overview](docs/architecture.md)
- [Contributing Guidelines](docs/contributing.md)

## 🐛 Troubleshooting

### Common Issues

**Web Serial API not working**
- Ensure you're using Chrome, Edge, or Opera
- Check that the site is served over HTTPS
- Verify hardware device is connected and recognized

**Audio not playing**
- Click anywhere on the page to initialize AudioContext
- Check browser audio permissions
- Verify volume settings in both app and system

**Demo mode not responding**
- Refresh the page and try again
- Check browser console for JavaScript errors
- Ensure demo mode is properly activated

### Getting Help
- 📧 Email: support@braillear.org
- 💬 Discord: [BRAILLEAR Community](https://discord.gg/braillear)
- 🐛 Issues: [GitHub Issues](https://github.com/braillear/webapp/issues)
- 📖 Docs: [Documentation Site](https://docs.braillear.org)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Team Cubic Vision**: Original project developers
- **Open Source Community**: Contributors and testers
- **Accessibility Experts**: Guidance on inclusive design
- **Educational Partners**: Schools and organizations providing feedback

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ Web application with demo mode
- ✅ Web Serial API integration
- ✅ Accessible design implementation
- ✅ Audio feedback system

### Phase 2 (Next)
- 🔄 Mobile application (Flutter/React Native)
- 🔄 Bluetooth connectivity (ESP32 integration)
- 🔄 Cloud synchronization and progress tracking
- 🔄 Multilingual audio support

### Phase 3 (Future)
- 📋 AI-powered adaptive learning
- 📋 Advanced analytics and reporting
- 📋 Integration with educational platforms
- 📋 Hardware manufacturing partnerships

---

**BRAILLEAR** - Empowering visually impaired learners through technology-driven inclusivity.

Made with ❤️ by Team Cubic Vision | [Website](https://braillear.org) | [GitHub](https://github.com/braillear)