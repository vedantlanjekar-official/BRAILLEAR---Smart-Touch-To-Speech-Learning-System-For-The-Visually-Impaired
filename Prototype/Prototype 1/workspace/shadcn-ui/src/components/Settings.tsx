import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Accessibility, 
  Palette, 
  Download, 
  Upload,
  RotateCcw,
  Save
} from 'lucide-react';
import { audioManager } from '@/lib/audioManager';

export default function Settings() {
  const [audioVolume, setAudioVolume] = useState([70]);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);

  const handleVolumeChange = (value: number[]) => {
    setAudioVolume(value);
    audioManager.setVolume(value[0] / 100);
  };

  const handleExportSettings = () => {
    const settings = {
      audioVolume: audioVolume[0],
      highContrast,
      reducedMotion,
      screenReader,
      audioFeedback,
      theme,
      language,
      autoSave,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'braillear-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            setAudioVolume([settings.audioVolume || 70]);
            setHighContrast(settings.highContrast || false);
            setReducedMotion(settings.reducedMotion || false);
            setScreenReader(settings.screenReader !== false);
            setAudioFeedback(settings.audioFeedback !== false);
            setTheme(settings.theme || 'system');
            setLanguage(settings.language || 'en');
            setAutoSave(settings.autoSave !== false);
          } catch (error) {
            console.error('Failed to import settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetToDefaults = () => {
    setAudioVolume([70]);
    setHighContrast(false);
    setReducedMotion(false);
    setScreenReader(true);
    setAudioFeedback(true);
    setTheme('system');
    setLanguage('en');
    setAutoSave(true);
    audioManager.setVolume(0.7);
  };

  return (
    <div className="space-y-6">
      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Settings
          </CardTitle>
          <CardDescription>
            Configure audio feedback and volume preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Audio Volume: {audioVolume[0]}%</Label>
            <Slider
              value={audioVolume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audio Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Enable audio playback for sensor interactions
              </p>
            </div>
            <Switch
              checked={audioFeedback}
              onCheckedChange={setAudioFeedback}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Configure accessibility features for better usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase color contrast for better visibility
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced announcements for screen readers
              </p>
            </div>
            <Switch
              checked={screenReader}
              onCheckedChange={setScreenReader}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>
            Configure system behavior and data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Settings</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save changes to preferences
              </p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportSettings} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </Button>
            <Button onClick={handleImportSettings} variant="outline" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Import Settings
            </Button>
          </div>

          <Button onClick={resetToDefaults} variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            Overview of your current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="secondary">Volume</Badge>
              <p className="text-sm font-medium mt-1">{audioVolume[0]}%</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary">Theme</Badge>
              <p className="text-sm font-medium mt-1 capitalize">{theme}</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary">Language</Badge>
              <p className="text-sm font-medium mt-1">{language.toUpperCase()}</p>
            </div>
            <div className="text-center">
              <Badge variant={highContrast ? "default" : "secondary"}>
                High Contrast
              </Badge>
              <p className="text-sm font-medium mt-1">{highContrast ? 'On' : 'Off'}</p>
            </div>
            <div className="text-center">
              <Badge variant={screenReader ? "default" : "secondary"}>
                Screen Reader
              </Badge>
              <p className="text-sm font-medium mt-1">{screenReader ? 'On' : 'Off'}</p>
            </div>
            <div className="text-center">
              <Badge variant={autoSave ? "default" : "secondary"}>
                Auto-save
              </Badge>
              <p className="text-sm font-medium mt-1">{autoSave ? 'On' : 'Off'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}