// Serial communication and hardware simulation for BRAILLEAR
export interface SerialEvent {
  character: string;
  timestamp: Date;
  source: 'hardware' | 'demo';
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'demo';

export class SerialManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private status: ConnectionStatus = 'disconnected';
  private eventListeners: ((event: SerialEvent) => void)[] = [];
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  private demoInterval: NodeJS.Timeout | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    // Check if Web Serial API is supported
    if (!('serial' in navigator)) {
      console.warn('Web Serial API not supported in this browser');
    }
  }

  // Web Serial API connection
  async connectToHardware(): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported');
    }

    try {
      this.setStatus('connecting');
      
      // Request port access
      this.port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x2E8A, usbProductId: 0x0005 } // Raspberry Pi Pico
        ]
      });

      // Open the port
      await this.port.open({ baudRate: 9600 });
      
      this.setStatus('connected');
      this.startReading();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to hardware:', error);
      this.setStatus('disconnected');
      return false;
    }
  }

  private async startReading() {
    if (!this.port?.readable) return;

    this.reader = this.port.readable.getReader();
    
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        
        // Decode received data
        const text = new TextDecoder().decode(value);
        const characters = text.trim().split('').filter(c => /[A-Z0-9]/.test(c));
        
        characters.forEach(char => {
          this.emitEvent({
            character: char,
            timestamp: new Date(),
            source: 'hardware'
          });
        });
      }
    } catch (error) {
      console.error('Error reading from serial port:', error);
    } finally {
      this.reader?.releaseLock();
    }
  }

  async disconnect() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader.releaseLock();
      this.reader = null;
    }
    
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    
    this.stopDemo();
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
      this.setStatus('disconnected');
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
    if (!this.isDemoMode) return;
    
    this.emitEvent({
      character: character.toUpperCase(),
      timestamp: new Date(),
      source: 'demo'
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

  isWebSerialSupported(): boolean {
    return 'serial' in navigator;
  }
}

export const serialManager = new SerialManager();