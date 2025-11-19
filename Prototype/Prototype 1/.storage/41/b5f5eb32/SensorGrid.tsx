import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serialManager, type SerialEvent } from '@/lib/serialManager';
import { audioManager } from '@/lib/audioManager';

interface SensorGridProps {
  onCharacterSelect?: (character: string) => void;
  isDemoMode?: boolean;
}

export default function SensorGrid({ onCharacterSelect }: SensorGridProps) {
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<Map<string, number>>(new Map());

  const letters = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
    ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  ];

  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  useEffect(() => {
    const unsubscribe = serialManager.onEvent((event: SerialEvent) => {
      handleCharacterActivation(event.character);
    });

    return unsubscribe;
  }, []);

  const handleCharacterActivation = (character: string) => {
    setActiveCharacter(character);
    
    // Track recent events for visual feedback
    setRecentEvents(prev => {
      const newMap = new Map(prev);
      newMap.set(character, Date.now());
      return newMap;
    });

    // Clear active state after animation
    setTimeout(() => {
      setActiveCharacter(null);
    }, 300);

    // Clean up old events
    setTimeout(() => {
      setRecentEvents(prev => {
        const newMap = new Map(prev);
        const cutoff = Date.now() - 2000; // 2 seconds
        for (const [char, timestamp] of newMap.entries()) {
          if (timestamp < cutoff) {
            newMap.delete(char);
          }
        }
        return newMap;
      });
    }, 2000);
  };

  const handleManualTouch = async (character: string) => {
    // Simulate touch
    serialManager.simulateTouch(character);
    
    // Play audio
    await audioManager.playCharacter(character);
    
    // Notify parent component
    onCharacterSelect?.(character);
  };

  const isRecentlyActivated = (character: string) => {
    const timestamp = recentEvents.get(character);
    if (!timestamp) return false;
    return Date.now() - timestamp < 2000;
  };

  const getSensorButtonClass = (character: string) => {
    const baseClass = "h-12 w-12 md:h-14 md:w-14 text-lg font-bold rounded-lg transition-all duration-200 border-2";
    const isActive = activeCharacter === character;
    const isRecent = isRecentlyActivated(character);
    
    if (isActive) {
      return `${baseClass} bg-blue-600 text-white border-blue-600 scale-105 shadow-lg`;
    } else if (isRecent) {
      return `${baseClass} bg-blue-100 text-blue-700 border-blue-300 shadow-md`;
    } else {
      return `${baseClass} bg-white hover:bg-blue-50 text-slate-700 border-slate-300 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Letters Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Alphabet Sensors (A-Z)</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Click to Test
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {letters.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2 md:gap-3">
                {row.map((letter) => (
                  <Button
                    key={letter}
                    className={getSensorButtonClass(letter)}
                    onClick={() => handleManualTouch(letter)}
                    aria-label={`Letter ${letter} sensor - click to test`}
                    aria-pressed={activeCharacter === letter}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Numbers Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Number Sensors (0-9)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center flex-wrap gap-2 md:gap-3">
            {numbers.map((number) => (
              <Button
                key={number}
                className={getSensorButtonClass(number)}
                onClick={() => handleManualTouch(number)}
                aria-label={`Number ${number} sensor - click to test`}
                aria-pressed={activeCharacter === number}
              >
                {number}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-blue-900 mb-2">How to Use</h4>
            <p className="text-sm text-blue-700">
              Click any sensor button above to simulate a touch event. 
              The system will play the corresponding audio and log the event.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visual Feedback for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeCharacter && `Sensor ${activeCharacter} activated`}
      </div>
    </div>
  );
}