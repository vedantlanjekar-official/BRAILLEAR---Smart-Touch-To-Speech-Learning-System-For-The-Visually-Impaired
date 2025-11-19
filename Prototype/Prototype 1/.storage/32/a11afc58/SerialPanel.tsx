import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Usb, 
  Wifi, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { serialManager, type ConnectionStatus } from '@/lib/serialManager';

export default function SerialPanel() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoInterval, setAutoInterval] = useState('2000');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSerialSupported] = useState(serialManager.isWebSerialSupported());

  useEffect(() => {
    const unsubscribe = serialManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setIsConnecting(false);
      
      if (newStatus === 'demo') {
        setIsDemoMode(true);
      } else if (newStatus === 'disconnected') {
        setIsDemoMode(false);
        setAutoPlay(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleConnectHardware = async () => {
    if (!isWebSerialSupported) {
      setError('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const success = await serialManager.connectToHardware();
      if (!success) {
        setError('Failed to connect to hardware. Please check your device connection.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to hardware';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await serialManager.disconnect();
    setError(null);
  };

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
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Connected</Badge>;
      case 'demo':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Demo Mode</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Connecting...</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'demo':
        return <Wifi className="h-5 w-5 text-blue-600" />;
      case 'connecting':
        return <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-slate-400" />;
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
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'disconnected' && (
              <>
                <Button
                  onClick={handleConnectHardware}
                  disabled={isConnecting || !isWebSerialSupported}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Usb className="mr-2 h-4 w-4" />
                      Connect Hardware
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleToggleDemo}
                  variant="outline"
                  className="flex-1"
                >
                  <Wifi className="mr-2 h-4 w-4" />
                  Start Demo Mode
                </Button>
              </>
            )}

            {(status === 'connected' || status === 'demo') && (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            )}
          </div>

          {!isWebSerialSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Web Serial API is not supported in this browser. 
                Hardware connection requires Chrome, Edge, or Opera. 
                You can still use Demo Mode to explore features.
              </AlertDescription>
            </Alert>
          )}
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
              {status === 'connected' ? 'Web Serial API' : 
               status === 'demo' ? 'Simulation' : 'None'}
            </span>
          </div>
          
          {status === 'connected' && (
            <div className="flex justify-between">
              <span>Baud Rate:</span>
              <span className="font-medium">9600</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Target Latency:</span>
            <span className="font-medium">&lt; 200ms</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded-lg">
          <p className="font-medium mb-1">Instructions:</p>
          {status === 'disconnected' ? (
            <p>
              Connect your Raspberry Pi Pico with BRAILLEAR firmware, or use Demo Mode to simulate hardware events.
            </p>
          ) : status === 'demo' ? (
            <p>
              Demo mode is active. Click sensors in the grid below or enable auto-play to simulate touch events.
            </p>
          ) : (
            <p>
              Hardware connected. Touch any sensor on your BRAILLEAR device to trigger audio feedback.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}