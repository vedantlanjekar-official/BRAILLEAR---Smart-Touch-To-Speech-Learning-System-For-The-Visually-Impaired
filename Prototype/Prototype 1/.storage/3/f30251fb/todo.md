# BRAILLEAR Webapp Development Plan

## MVP Implementation Plan

### Core Files to Create/Modify:
1. **src/pages/Landing.tsx** - Landing page with project overview, features, and CTA
2. **src/pages/Login.tsx** - Authentication page with email/password
3. **src/pages/Dashboard.tsx** - Main app interface with hardware simulation
4. **src/pages/Contact.tsx** - Contact form and information
5. **src/components/Header.tsx** - Navigation header
6. **src/components/SerialPanel.tsx** - Hardware connection and demo controls
7. **src/components/SensorGrid.tsx** - Visual grid of 26 letters + 10 numbers
8. **src/components/AudioPlayer.tsx** - Audio playback management
9. **src/components/EventLog.tsx** - Timestamped event history
10. **src/components/Settings.tsx** - Demo mode, volume, and other settings
11. **src/lib/audioManager.ts** - Audio file management and playback
12. **src/lib/serialManager.ts** - Web Serial API and demo simulation
13. **src/lib/auth.ts** - Basic authentication logic
14. **public/audio/** - Sample audio files (A-Z, 0-9)
15. **index.html** - Update title and meta tags

### Key Features to Implement:
- Responsive landing page with accessibility focus
- Login/logout functionality with JWT simulation
- Dashboard with hardware connection status
- Demo mode with simulated UART events
- Visual sensor grid that highlights on activation
- Real-time audio playback (<200ms latency target)
- Event logging with timestamps
- Web Serial API integration
- Accessible design (ARIA labels, keyboard nav, high contrast)
- Professional navy/teal color scheme

### Technical Constraints:
- Use shadcn-ui components for consistency
- Implement Web Audio API for immediate playback
- Support both demo and real hardware modes
- Maintain <200ms latency for audio feedback
- Follow accessibility guidelines (WCAG)
- Responsive design for mobile/desktop