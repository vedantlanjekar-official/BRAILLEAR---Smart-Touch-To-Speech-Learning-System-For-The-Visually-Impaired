import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wifi, 
  CheckCircle
} from 'lucide-react';
import { serialManager, type ConnectionStatus } from '@/lib/serialManager';

export default function SerialPanel() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoInterval, setAutoInterval] = useState('2000');

  useEffect(() => {
    const unsubscribe = serialManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      if (newStatus === 'demo') {
        setIsDemoMode(true);
      } else if (newStatus === 'connected') {
        setIsDemoMode(false);
        setAutoPlay(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleToggleDemo = () => {
    if (isDemoMode) {
      serialManager.stopDemo();
      setIsDemoMode(false);
      setAutoPlay(false);
    } else {
      serialManager.startDemo(autoPlay, parseInt(autoInterval));
      setIsDemoMode(true);
    }
  };

  const handleToggleAutoPlay = () => {
    const newAutoPlay = !autoPlay;
    setAutoPlay(newAutoPlay);
    
    if (isDemoMode) {
      serialManager.stopDemo();
      serialManager.startDemo(newAutoPlay, parseInt(autoInterval));
    }
  };

  const handleIntervalChange = (value: string) => {
    setAutoInterval(value);
    
    if (isDemoMode && autoPlay) {
      serialManager.stopDemo();
      serialManager.startDemo(true, parseInt(value));
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700">Hardware Connected</Badge>;
      case 'demo':
        return <Badge className="bg-blue-100 text-blue-700">Demo Mode Active</Badge>;
      default:
        return <Badge variant="secondary">Connected</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'demo':
        return <Wifi className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            Hardware Connection
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleToggleDemo}
              variant={isDemoMode ? "default" : "outline"}
              className="flex-1"
            >
              <Wifi className="mr-2 h-4 w-4" />
              {isDemoMode ? 'Stop Demo Mode' : 'Start Demo Mode'}
            </Button>
          </div>
        </div>

        {/* Demo Controls */}
        {isDemoMode && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900">Demo Controls</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-play" className="text-sm text-blue-700">
                  Auto-play demo events
                </Label>
                <Switch
                  id="auto-play"
                  checked={autoPlay}
                  onCheckedChange={handleToggleAutoPlay}
                />
              </div>

              {autoPlay && (
                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-sm text-blue-700">
                    Event interval
                  </Label>
                  <Select value={autoInterval} onValueChange={handleIntervalChange}>
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">0.5 seconds</SelectItem>
                      <SelectItem value="1000">1 second</SelectItem>
                      <SelectItem value="2000">2 seconds</SelectItem>
                      <SelectItem value="3000">3 seconds</SelectItem>
                      <SelectItem value="5000">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Connection Type:</span>
            <span className="font-medium">
              {status === 'connected' ? 'Hardware Device' : 'Demo Simulation'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Baud Rate:</span>
            <span className="font-medium">9600</span>
          </div>
          
          <div className="flex justify-between">
            <span>Target Latency:</span>
            <span className="font-medium">&lt; 200ms</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded-lg">
          <p className="font-medium mb-1">Instructions:</p>
          {status === 'demo' ? (
            <p>
              Demo mode is active. Click sensors in the grid below or enable auto-play to simulate touch events.
            </p>
          ) : (
            <p>
              Hardware connected. Click sensors below to simulate touch events or enable demo mode for automatic simulation.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}