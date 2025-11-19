import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Settings as SettingsIcon, 
  Grid3X3, 
  Volume2,
  Usb,
  Info,
  Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import SerialPanel from '@/components/SerialPanel';
import SensorGrid from '@/components/SensorGrid';
import AudioPlayer from '@/components/AudioPlayer';
import EventLog from '@/components/EventLog';
import Settings from '@/components/Settings';
import { authManager, type User } from '@/lib/auth';
import { serialManager, type ConnectionStatus } from '@/lib/serialManager';
import { audioManager } from '@/lib/audioManager';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authManager.onAuthStateChange((currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setIsLoading(false);
      
      if (!currentUser) {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = serialManager.onStatusChange(setConnectionStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = async () => {
      await audioManager.resumeContext();
    };
    
    // Add click listener to initialize audio
    document.addEventListener('click', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initAudio);
    };
  }, []);

  const handleCharacterSelect = async (character: string) => {
    setSelectedCharacter(character);
    await audioManager.playCharacter(character);
    
    // Clear selection after a short delay
    setTimeout(() => {
      setSelectedCharacter(null);
    }, 500);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700">Hardware Ready</Badge>;
      case 'demo':
        return <Badge className="bg-blue-100 text-blue-700">Demo Mode Active</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Welcome back, {user.name}!
              </h1>
              <p className="text-slate-600 mt-1">
                BRAILLEAR Learning Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Ready:</strong> Hardware is connected and ready. 
            Click any sensor below to test audio feedback or enable demo mode for automatic simulation.
          </AlertDescription>
        </Alert>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Sensors</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Connection Panel */}
              <div className="lg:col-span-1">
                <SerialPanel />
              </div>
              
              {/* Event Log */}
              <div className="lg:col-span-2">
                <EventLog />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Usb className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">
                      {connectionStatus === 'connected' ? 'Hardware Ready' : 'Demo Mode'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Audio System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Ready</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Target Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <span className="font-semibold">&lt; 200ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sensors Tab */}
          <TabsContent value="sensors" className="space-y-6">
            <SensorGrid onCharacterSelect={handleCharacterSelect} />
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <AudioPlayer />
              <EventLog maxEvents={50} />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Screen reader live region for character announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedCharacter && `Character ${selectedCharacter} selected and audio played`}
      </div>
    </div>
  );
}