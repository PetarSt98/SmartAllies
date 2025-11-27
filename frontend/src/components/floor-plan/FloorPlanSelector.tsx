import { useState } from 'react';
import { MapPin, MousePointer2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FloorPlanPin } from '@/types/incident.types';

type Floor =
  | 'minusOne'
  | 'minusTwo'
  | 'minusThree'
  | 'ground'
  | 'first'
  | 'second'
  | 'third';

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
    <Card className="w-full border border-orange-100/80 bg-gradient-to-br from-white via-orange-50/40 to-white text-slate-900 shadow-xl ring-1 ring-orange-100">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 ring-1 ring-orange-200 shadow-inner">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">Map the incident</CardTitle>
            <p className="text-sm text-orange-700/80">Pick a floor, tap to drop a pin, and confirm.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FLOOR_LABELS) as Floor[]).map((floor) => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? 'default' : 'outline'}
              onClick={() => handleFloorChange(floor)}
              className={`rounded-full px-3 text-sm transition ${
                selectedFloor === floor
                  ? 'shadow-[0_10px_30px_rgba(249,91,53,0.35)]'
                  : 'border-orange-200 text-orange-700'
              }`}
              size="sm"
            >
              {FLOOR_LABELS[floor]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50 via-white to-orange-100/60 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,91,53,0.12),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(255,177,133,0.2),transparent_34%)]" aria-hidden />
          <div
            onClick={handleClick}
            className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-xl border border-orange-200/80 bg-white/70 backdrop-blur hover:border-orange-300"
            style={{
              backgroundImage: `url('${FLOOR_IMAGES[selectedFloor]}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-orange-50/40" />
            {pin && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full transform drop-shadow-xl"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <MapPin className="h-10 w-10 text-orange-600 drop-shadow-[0_10px_30px_rgba(249,91,53,0.55)]" />
                <div className="mt-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-900 ring-1 ring-orange-200">
                  {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          {!pin && (
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-medium text-orange-700 ring-1 ring-orange-200 backdrop-blur">
              <MousePointer2 className="h-4 w-4" />
              Tap anywhere on the highlighted floor to drop your pin
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-800">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.18em] text-orange-500">Selection</span>
            <span className="font-medium text-slate-900">
              {pin
                ? `X ${pin.x.toFixed(1)}% · Y ${pin.y.toFixed(1)}% on ${FLOOR_LABELS[selectedFloor]}`
                : 'Tap the map to drop a pin on the active floor'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPin(null)}
              className="border-orange-200 text-orange-700"
            >
              Reset
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!pin}
              className="shadow-[0_0_35px_rgba(249,91,53,0.35)]"
            >
              Confirm location
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
