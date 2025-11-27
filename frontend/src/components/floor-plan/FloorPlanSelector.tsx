import { type MouseEvent, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FloorPlanPin } from '@/types/incident.types';

type Floor =
  'minusOne'
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

const FLOOR_STACK_ORDER: Floor[] = [
  'third',
  'second',
  'first',
  'ground',
  'minusOne',
  'minusTwo',
  'minusThree',
];

export function FloorPlanSelector({ onLocationSelect }: FloorPlanSelectorProps) {
  const [selectedFloor, setSelectedFloor] = useState<Floor>('ground');
  const [pin, setPin] = useState<FloorPlanPin | null>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
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
    <Card className="w-full border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 shadow-2xl ring-1 ring-slate-800/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <MapPin className="h-5 w-5" />
          </span>
          Map the incident on our 3D campus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <div className="relative rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-inner backdrop-blur">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-indigo-600/10 blur-3xl" />
            <div className="relative h-[360px] w-full overflow-visible" style={{ perspective: '1400px' }}>
              <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
                {FLOOR_STACK_ORDER.map((floor, index) => {
                  const depth = (FLOOR_STACK_ORDER.length - index) * 18;
                  const yOffset = index * -18;

                  return (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => handleFloorChange(floor)}
                      className={`group absolute inset-0 rounded-2xl border border-white/5 bg-slate-800/80 shadow-2xl transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        selectedFloor === floor
                          ? 'ring-2 ring-primary shadow-primary/50 scale-[1.01]'
                          : 'hover:-translate-y-1 hover:shadow-lg'
                      }`}
                      style={{
                        transform: `translateY(${yOffset}px) translateZ(${depth}px) rotateX(58deg)`,
                        transformStyle: 'preserve-3d',
                        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(148,163,184,0.08)), url('${FLOOR_IMAGES[floor]}')`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                      aria-pressed={selectedFloor === floor}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 via-transparent to-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30 backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" />
                        {FLOOR_LABELS[floor]} Floor
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {FLOOR_STACK_ORDER.map((floor) => (
                <Button
                  key={floor}
                  size="sm"
                  variant={selectedFloor === floor ? 'default' : 'outline'}
                  className="rounded-full border-slate-700 text-xs"
                  onClick={() => handleFloorChange(floor)}
                >
                  {FLOOR_LABELS[floor]}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/70 shadow-xl backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.08),transparent_35%)]" />
            <div className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Interactive floor map</p>
                <p className="text-lg font-semibold text-slate-50">{FLOOR_LABELS[selectedFloor]} level</p>
              </div>
              <span className="rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80">
                Tap anywhere to drop a pin
              </span>
            </div>

            <div
              onClick={handleClick}
              className="relative m-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-slate-700/70 bg-slate-950/70 shadow-inner ring-1 ring-slate-800/50 transition hover:border-primary/50 hover:ring-primary/30"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.06)), url('${FLOOR_IMAGES[selectedFloor]}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'crosshair',
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_45%)] opacity-50" />
              {pin && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-full transform"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <MapPin className="h-10 w-10 text-primary drop-shadow-[0_8px_20px_rgba(59,130,246,0.45)]" />
                  <div className="mt-1 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-100 ring-1 ring-slate-700/60">
                    {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 text-sm text-slate-300">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Selection</span>
                <span className="font-medium text-slate-100">
                  {pin
                    ? `X ${pin.x.toFixed(1)}% · Y ${pin.y.toFixed(1)}%`
                    : 'Choose a spot on the map to mark the incident'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPin(null)} className="border-slate-700 text-slate-100">
                  Reset
                </Button>
                <Button onClick={handleConfirm} disabled={!pin} className="shadow-[0_0_25px_rgba(59,130,246,0.35)]">
                  Confirm location
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
