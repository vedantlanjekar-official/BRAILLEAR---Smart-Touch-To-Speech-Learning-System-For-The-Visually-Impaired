// Serial communication for BRAILLEAR hardware integration
export interface SerialEvent {
  character: string;
  timestamp: Date;
  source: 'hardware' | 'demo';
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'demo';

export class SerialManager {
  private status: ConnectionStatus = 'disconnected';
  private eventListeners: ((event: SerialEvent) => void)[] = [];
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  private demoInterval: NodeJS.Timeout | null = null;
  private isDemoMode: boolean = false;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isReading: boolean = false;

  constructor() {
    // Check Web Serial API support
    if (!this.isWebSerialSupported()) {
      console.warn('Web Serial API not supported, falling back to demo mode');
      this.setStatus('demo');
    } else {
      this.setStatus('disconnected');
    }
  }

  // Connect to hardware via Web Serial API
  async connectToHardware(): Promise<boolean> {
    if (!this.isWebSerialSupported()) {
      console.warn('Web Serial API not supported');
      this.setStatus('demo');
      return false;
    }

    try {
      // Request port access
      this.port = await navigator.serial.requestPort();
      
      // Open port with configuration matching receiver firmware
      await this.port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      console.log('Serial port opened successfully');
      this.setStatus('connected');
      
      // Start reading from serial port
      this.startReading();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to hardware:', error);
      this.setStatus('demo');
      return false;
    }
  }

  private async startReading() {
    if (!this.port || this.isReading) return;
    
    this.isReading = true;
    const decoder = new TextDecoder();
    
    try {
      while (this.port.readable && this.isReading) {
        this.reader = this.port.readable.getReader();
        
        try {
          while (true) {
            const { value, done } = await this.reader.read();
            
            if (done) {
              break;
            }
            
            // Decode received bytes
            const text = decoder.decode(value, { stream: true });
            
            // Process each character
            for (const char of text) {
              // Filter for valid A-Z characters
              if (char >= 'A' && char <= 'Z') {
                this.emitEvent({
                  character: char,
                  timestamp: new Date(),
                  source: 'hardware'
                });
              }
            }
          }
        } catch (error) {
          console.error('Error reading from serial port:', error);
          break;
        } finally {
          if (this.reader) {
            this.reader.releaseLock();
            this.reader = null;
          }
        }
      }
    } catch (error) {
      console.error('Serial reading error:', error);
    } finally {
      this.isReading = false;
    }
  }

  async disconnect() {
    this.stopDemo();
    this.isReading = false;
    
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      } catch (error) {
        console.error('Error closing reader:', error);
      }
    }
    
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
      } catch (error) {
        console.error('Error closing port:', error);
      }
    }
    
    this.setStatus('disconnected');
  }

  // Demo mode functionality
  startDemo(autoPlay: boolean = false, interval: number = 2000) {
    this.isDemoMode = true;
    this.setStatus('demo');
    
    if (autoPlay) {
      this.startAutoDemo(interval);
    }
  }

  stopDemo() {
    this.isDemoMode = false;
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    
    if (this.status === 'demo') {
      this.setStatus('connected');
    }
  }

  private startAutoDemo(interval: number) {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
    }

    const characters = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    this.demoInterval = setInterval(() => {
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      this.simulateTouch(randomChar);
    }, interval);
  }

  simulateTouch(character: string) {
    this.emitEvent({
      character: character.toUpperCase(),
      timestamp: new Date(),
      source: this.isDemoMode ? 'demo' : 'hardware'
    });
  }

  // Event management
  private emitEvent(event: SerialEvent) {
    this.eventListeners.forEach(listener => listener(event));
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  onEvent(listener: (event: SerialEvent) => void) {
    this.eventListeners.push(listener);
    
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  onStatusChange(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.push(listener);
    
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.port !== null;
  }

  isWebSerialSupported(): boolean {
    return 'serial' in navigator && 'SerialPort' in window;
  }
}

export const serialManager = new SerialManager();