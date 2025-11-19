import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Filter } from 'lucide-react';
import { serialManager, type SerialEvent } from '@/lib/serialManager';

interface EventLogProps {
  maxEvents?: number;
}

export default function EventLog({ maxEvents = 100 }: EventLogProps) {
  const [events, setEvents] = useState<SerialEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'hardware' | 'demo'>('all');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = serialManager.onEvent((event: SerialEvent) => {
      setEvents(prev => {
        const newEvents = [event, ...prev];
        return newEvents.slice(0, maxEvents);
      });
    });

    return unsubscribe;
  }, [maxEvents]);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [events]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.source === filter;
  });

  const clearLog = () => {
    setEvents([]);
  };

  const exportLog = () => {
    const data = events.map(event => ({
      timestamp: event.timestamp.toISOString(),
      character: event.character,
      source: event.source
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braillear-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getSourceBadge = (source: SerialEvent['source']) => {
    return source === 'hardware' ? (
      <Badge className="bg-green-100 text-green-700 text-xs">HW</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 text-xs">DEMO</Badge>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Event Log</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filteredEvents.length} events
            </Badge>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-8 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === 'hardware' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('hardware')}
              className="h-8 text-xs"
            >
              Hardware
            </Button>
            <Button
              variant={filter === 'demo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('demo')}
              className="h-8 text-xs"
            >
              Demo
            </Button>
          </div>
          
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLog}
              disabled={events.length === 0}
              className="h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLog}
              disabled={events.length === 0}
              className="h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80" ref={scrollAreaRef}>
          <div className="p-4 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events to display</p>
                <p className="text-xs mt-1">
                  {filter === 'all' 
                    ? 'Touch sensors or start demo mode to see events'
                    : `No ${filter} events found`
                  }
                </p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <div
                  key={`${event.timestamp.getTime()}-${event.character}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {event.character}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Character: {event.character}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getSourceBadge(event.source)}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Live indicator */}
      {events.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live event monitoring active
          </div>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {events.length > 0 && `Latest event: ${events[0].character} from ${events[0].source}`}
      </div>
    </Card>
  );
}