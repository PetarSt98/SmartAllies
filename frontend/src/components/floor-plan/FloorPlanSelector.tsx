import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FloorPlanPin } from '@/types/incident.types';

interface FloorPlanSelectorProps {
  onLocationSelect: (location: string) => void;
}

export function FloorPlanSelector({ onLocationSelect }: FloorPlanSelectorProps) {
  const [pin, setPin] = useState<FloorPlanPin | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPin({ x, y });
  };

  const handleConfirm = () => {
    if (pin) {
      onLocationSelect(`Floor plan location: ${pin.x.toFixed(1)}%, ${pin.y.toFixed(1)}%`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location on Floor Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onClick={handleClick}
          className="relative w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair hover:bg-gray-50 transition-colors"
          style={{
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {!pin && <p>Click anywhere to pin the incident location</p>}
          </div>
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
