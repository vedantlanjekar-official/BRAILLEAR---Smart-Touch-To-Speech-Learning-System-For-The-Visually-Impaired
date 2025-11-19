// Audio management for BRAILLEAR system
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.7;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.preloadAudioFiles();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private async preloadAudioFiles() {
    const characters = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    for (const char of characters) {
      try {
        // For demo purposes, we'll generate synthetic audio
        // In production, replace with actual audio file loading
        const buffer = await this.generateSyntheticAudio(char);
        this.audioBuffers.set(char, buffer);
      } catch (error) {
        console.warn(`Failed to load audio for ${char}:`, error);
      }
    }
  }

  private async generateSyntheticAudio(character: string): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    
    // Generate a simple tone for demo purposes
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5; // 500ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Generate frequency based on character (simple mapping)
    const baseFreq = 200;
    const charCode = character.charCodeAt(0);
    const frequency = baseFreq + (charCode % 26) * 20;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.3;
    }
    
    return buffer;
  }

  async playCharacter(character: string): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      await this.initializeAudioContext();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    const buffer = this.audioBuffers.get(character.toUpperCase());
    if (!buffer || !this.audioContext) {
      console.warn(`No audio buffer found for character: ${character}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
      
      // Announce to screen readers
      this.announceToScreenReader(`Audio: Letter ${character} played`);
    } catch (error) {
      console.error(`Failed to play audio for ${character}:`, error);
    }
  }

  private announceToScreenReader(message: string) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export const audioManager = new AudioManager();