import type React from 'react';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FloorPlanPin } from '@/types/incident.types';
import type { Floor, FloorPlanSelection } from '@/types/floor-plan.types';

interface FloorPlanSelectorProps {
  onLocationSelect: (selection: FloorPlanSelection) => void;
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
      onLocationSelect({
        floor: selectedFloor,
        floorLabel: FLOOR_LABELS[selectedFloor],
        imagePath: FLOOR_IMAGES[selectedFloor],
        x: pin.x,
        y: pin.y,
      });
    }
  };

  const handleFloorChange = (floor: Floor) => {
    setSelectedFloor(floor);
    setPin(null);
  };

  return (
    <Card className="w-full overflow-hidden border-orange-100/80 shadow-[0_25px_80px_-55px_rgba(249,115,22,0.75)] bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl relative">
      <div className="absolute inset-x-0 -top-16 h-24 bg-gradient-to-b from-orange-100/60 via-white to-white" aria-hidden />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-inner border border-orange-100">
            <MapPin className="h-5 w-5" />
          </span>
          Select Location on Floor Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FLOOR_LABELS) as Floor[]).map((floor) => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? 'default' : 'outline'}
              onClick={() => handleFloorChange(floor)}
              className="shadow-sm"
            >
              {FLOOR_LABELS[floor]}
            </Button>
          ))}
        </div>

        <div
          onClick={handleClick}
          className="relative w-full bg-gradient-to-br from-orange-50 via-white to-orange-50 border border-orange-100 rounded-2xl cursor-crosshair hover:shadow-lg transition-all overflow-hidden aspect-[4/3]"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(255,255,255,0.75), rgba(255,255,255,0.75)), url('${FLOOR_IMAGES[selectedFloor]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            touchAction: 'manipulation',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.08),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.08),transparent_32%)]" aria-hidden />
          {pin && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-full drop-shadow-xl"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <MapPin className="h-8 w-8 text-primary fill-primary" />
            </div>
          )}
        </div>

        {pin && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-700 bg-orange-50/70 border border-orange-100 rounded-xl px-3 py-2 shadow-inner">
              Location selected: X: {pin.x.toFixed(1)}%, Y: {pin.y.toFixed(1)}%
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPin(null)} className="shadow-sm">
                Reset
              </Button>
              <Button onClick={handleConfirm} className="shadow-md">
                Confirm Location
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
