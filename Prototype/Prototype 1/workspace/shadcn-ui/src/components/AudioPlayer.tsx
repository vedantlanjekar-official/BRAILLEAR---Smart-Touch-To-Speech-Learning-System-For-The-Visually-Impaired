import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  RotateCcw,
  Settings,
  Headphones
} from 'lucide-react';
import { audioManager } from '@/lib/audioManager';
import { serialManager, type SerialEvent } from '@/lib/serialManager';
import { authManager } from '@/lib/auth';

export default function AudioPlayer() {
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [audioLatency, setAudioLatency] = useState<number | null>(null);

  useEffect(() => {
    // Initialize volume from user preferences
    const user = authManager.getCurrentUser();
    if (user?.preferences.audioVolume) {
      const savedVolume = user.preferences.audioVolume;
      setVolume(savedVolume);
      audioManager.setVolume(savedVolume);
    }
  }, []);

  useEffect(() => {
    // Listen for serial events and play audio
    const unsubscribe = serialManager.onEvent(async (event: SerialEvent) => {
      if (!isMuted) {
        const startTime = performance.now();
        await handlePlayCharacter(event.character);
        const endTime = performance.now();
        setAudioLatency(endTime - startTime);
      }
    });

    return unsubscribe;
  }, [isMuted]);

  const handlePlayCharacter = async (character: string) => {
    try {
      setIsPlaying(true);
      setLastPlayed(character);
      
      await audioManager.playCharacter(character);
      
      setPlayCount(prev => prev + 1);
      
      // Reset playing state after a short delay
      setTimeout(() => {
        setIsPlaying(false);
      }, 500);
    } catch (error) {
      console.error('Failed to play character:', error);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    audioManager.setVolume(vol);
    
    // Save to user preferences
    authManager.updatePreferences({ audioVolume: vol });
    
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      audioManager.setVolume(0);
    } else {
      audioManager.setVolume(volume);
    }
  };

  const testAudio = async () => {
    const testChar = 'A';
    await handlePlayCharacter(testChar);
  };

  const resetAudioSystem = async () => {
    try {
      await audioManager.resumeContext();
      setPlayCount(0);
      setLastPlayed(null);
      setAudioLatency(null);
    } catch (error) {
      console.error('Failed to reset audio system:', error);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" />;
    }
    return <Volume2 className="h-4 w-4" />;
  };

  const formatLatency = (latency: number | null) => {
    if (latency === null) return 'N/A';
    return `${latency.toFixed(1)}ms`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Audio Player
          </span>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                Playing
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {playCount} played
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Volume</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {getVolumeIcon()}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <VolumeX className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              className="flex-1"
              aria-label="Volume control"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Audio Settings
          </h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="crossfade" className="text-sm">
              Crossfade overlapping sounds
            </Label>
            <Switch
              id="crossfade"
              checked={crossfadeEnabled}
              onCheckedChange={setCrossfadeEnabled}
            />
          </div>
        </div>

        {/* Status Information */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Played:</span>
            <span className="font-medium">
              {lastPlayed || 'None'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Audio Latency:</span>
            <span className="font-medium">
              {formatLatency(audioLatency)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Events:</span>
            <span className="font-medium">{playCount}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={testAudio}
            disabled={isPlaying}
            className="flex-1"
            variant="outline"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Playing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Test Audio
              </>
            )}
          </Button>
          
          <Button
            onClick={resetAudioSystem}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Performance Info */}
        <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded border border-blue-200">
          <p className="font-medium text-blue-900 mb-1">Performance Target:</p>
          <p className="text-blue-700">
            Audio feedback latency should be &lt; 200ms for optimal learning experience. 
            Current latency: {formatLatency(audioLatency)}
          </p>
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isPlaying && lastPlayed && `Playing audio for ${lastPlayed}`}
          {isMuted && 'Audio muted'}
          {!isMuted && volume > 0 && `Volume set to ${Math.round(volume * 100)}%`}
        </div>
      </CardContent>
    </Card>
  );
}