import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Info,
  Accessibility,
  Volume2,
  Monitor
} from 'lucide-react';
import { authManager, type User } from '@/lib/auth';
import { audioManager } from '@/lib/audioManager';

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [serialPort, setSerialPort] = useState('');
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReader, setScreenReader] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const unsubscribe = authManager.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserPreferences(currentUser);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserPreferences = (currentUser: User) => {
    setDemoMode(currentUser.preferences.demoMode);
    setAudioVolume(currentUser.preferences.audioVolume);
    setSerialPort(currentUser.preferences.serialPort || '');
    setHasUnsavedChanges(false);
  };

  const handleSaveSettings = () => {
    if (!user) return;

    const newPreferences = {
      demoMode,
      audioVolume,
      serialPort: serialPort || undefined
    };

    authManager.updatePreferences(newPreferences);
    audioManager.setVolume(audioVolume);
    setHasUnsavedChanges(false);
  };

  const handleResetToDefaults = () => {
    setDemoMode(true);
    setAudioVolume(0.7);
    setSerialPort('');
    setHighContrast(false);
    setLargeText(false);
    setScreenReader(true);
    setHasUnsavedChanges(true);
  };

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleDemoModeChange = (checked: boolean) => {
    setDemoMode(checked);
    markAsChanged();
  };

  const handleVolumeChange = (value: number[]) => {
    setAudioVolume(value[0]);
    markAsChanged();
  };

  const handleSerialPortChange = (value: string) => {
    setSerialPort(value);
    markAsChanged();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <SettingsIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Please sign in to access settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Application Settings
            </span>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Unsaved Changes
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Mode Settings */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Demo Mode Settings
            </h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="demo-mode" className="text-sm font-medium">
                  Enable Demo Mode by Default
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Start in demo mode when no hardware is connected
                </p>
              </div>
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={handleDemoModeChange}
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio Settings
            </h4>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Default Volume</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-8">0%</span>
                <Slider
                  value={[audioVolume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12">100%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {Math.round(audioVolume * 100)}%
              </p>
            </div>
          </div>

          {/* Hardware Settings */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900">Hardware Settings</h4>
            
            <div className="space-y-3">
              <Label htmlFor="serial-port" className="text-sm font-medium">
                Preferred Serial Port
              </Label>
              <Select value={serialPort} onValueChange={handleSerialPortChange}>
                <SelectTrigger id="serial-port">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-detect</SelectItem>
                  <SelectItem value="COM3">COM3 (Windows)</SelectItem>
                  <SelectItem value="COM4">COM4 (Windows)</SelectItem>
                  <SelectItem value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux)</SelectItem>
                  <SelectItem value="/dev/ttyACM0">/dev/ttyACM0 (Linux)</SelectItem>
                  <SelectItem value="/dev/cu.usbmodem">/dev/cu.usbmodem (macOS)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave blank for automatic detection via Web Serial API
              </p>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessibility Settings
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="large-text" className="text-sm font-medium">
                    Large Text
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increase text size throughout the application
                  </p>
                </div>
                <Switch
                  id="large-text"
                  checked={largeText}
                  onCheckedChange={setLargeText}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="screen-reader" className="text-sm font-medium">
                    Screen Reader Support
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enhanced ARIA labels and live announcements
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={screenReader}
                  onCheckedChange={setScreenReader}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            
            <Button
              onClick={handleResetToDefaults}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Settings are automatically saved to your browser's local storage. 
              Some changes may require refreshing the page to take full effect.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}