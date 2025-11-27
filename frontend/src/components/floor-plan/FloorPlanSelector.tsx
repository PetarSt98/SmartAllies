import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FloorPlanPin } from '@/types/incident.types';

type Floor = 'minusOne' | 'minusTwo' | 'minusThree' | 'ground' | 'first' | 'second' | 'third';

interface FloorPlanSelectorProps {
  onLocationSelect: (location: string) => void;
}

const FLOOR_IMAGES: Record<Floor, string> = {
  minusThree: '/images/floor-plans/minus-three.svg',
  minusTwo: '/images/floor-plans/minus-two.svg',
  minusOne: '/images/floor-plans/minus-one.svg',
  ground: '/images/floor-plans/ground-floor.svg',
  first: '/images/floor-plans/first-floor.svg',
  second: '/images/floor-plans/second-floor.svg',
  third: '/images/floor-plans/third-floor.svg',
};

const FLOOR_LABELS: Record<Floor, string> = {
  minusThree: '-3',
  minusTwo: '-2',
  minusOne: '-1',
  ground: 'Ground',
  first: '1st',
  second: '2nd',
  third: '3rd',
};

export function FloorPlanSelector({ onLocationSelect }: FloorPlanSelectorProps) {
  const [selectedFloor, setSelectedFloor] = useState<Floor>('ground');
  const [pin, setPin] = useState<FloorPlanPin | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPin({ x, y });
  };

  const handleConfirm = () => {
    if (pin) {
      onLocationSelect(
        `Floor plan location: ${FLOOR_LABELS[selectedFloor]}, X: ${pin.x.toFixed(1)}%, Y: ${pin.y.toFixed(1)}%`
      );
    }
  };

  const handleFloorChange = (floor: Floor) => {
    setSelectedFloor(floor);
    setPin(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location on Floor Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(Object.keys(FLOOR_LABELS) as Floor[]).map((floor) => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? 'default' : 'outline'}
              onClick={() => handleFloorChange(floor)}
            >
              {FLOOR_LABELS[floor]}
            </Button>
          ))}
        </div>

        <div
          onClick={handleClick}
          className="relative w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair hover:bg-gray-50 transition-colors overflow-hidden"
          style={{
            backgroundImage: `url('${FLOOR_IMAGES[selectedFloor]}')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {pin && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <MapPin className="h-8 w-8 text-primary fill-primary" />
            </div>
          )}
        </div>

        {pin && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Location selected: X: {pin.x.toFixed(1)}%, Y: {pin.y.toFixed(1)}%
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPin(null)}>
                Reset
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Location
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
