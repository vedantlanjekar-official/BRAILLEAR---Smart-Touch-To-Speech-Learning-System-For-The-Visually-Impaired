// Serial communication simulation for BRAILLEAR demo
export interface SerialEvent {
  character: string;
  timestamp: Date;
  source: 'hardware' | 'demo';
}

export type ConnectionStatus = 'connected' | 'demo';

export class SerialManager {
  private status: ConnectionStatus = 'connected';
  private eventListeners: ((event: SerialEvent) => void)[] = [];
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  private demoInterval: NodeJS.Timeout | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    // Always assume hardware is connected for demo
    this.setStatus('connected');
  }

  // Simulate hardware connection (always successful)
  async connectToHardware(): Promise<boolean> {
    this.setStatus('connected');
    return true;
  }

  async disconnect() {
    this.stopDemo();
    this.setStatus('connected'); // Keep connected for demo
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

  isWebSerialSupported(): boolean {
    return true; // Always supported for demo
  }
}

export const serialManager = new SerialManager();