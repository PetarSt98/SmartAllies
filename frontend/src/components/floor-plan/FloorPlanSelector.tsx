import { type MouseEvent, useMemo, useState } from 'react';
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
  const [hoveredFloor, setHoveredFloor] = useState<Floor | null>(null);

  const activeFloor = hoveredFloor ?? selectedFloor;

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

  const stackLayers = useMemo(
    () =>
      FLOOR_STACK_ORDER.map((floor, index) => {
        const layerOffset = index * 12;
        const depth = index * 28;
        const isActive = activeFloor === floor;

        return {
          floor,
          depth,
          layerOffset,
          isActive,
        };
      }),
    [activeFloor]
  );

  return (
    <Card className="w-full border-0 bg-slate-950 text-slate-50 shadow-2xl ring-1 ring-slate-800/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
            <MapPin className="h-5 w-5" />
          </span>
          Map the incident on our 3D campus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-inner">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(250,91,53,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(250,91,53,0.08),transparent_30%)]" />
            <div className="relative h-[380px] w-full" style={{ perspective: '1600px' }}>
              <div
                className="absolute inset-x-8 bottom-8 h-20 rounded-full bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 blur-3xl"
                aria-hidden
              />
              <div
                className="relative h-full w-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(54deg) rotateZ(-4deg) translateZ(-140px)',
                }}
              >
                {stackLayers.map(({ floor, depth, layerOffset, isActive }) => (
                  <button
                    key={floor}
                    type="button"
                    onMouseEnter={() => setHoveredFloor(floor)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorChange(floor)}
                    aria-pressed={selectedFloor === floor}
                    className="group absolute inset-0"
                    style={{
                      transform: `translateY(-${layerOffset}px) translateZ(${depth}px)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition duration-500 ease-out ${
                        isActive ? 'ring-2 ring-primary/70 scale-[1.015]' : 'opacity-40 hover:opacity-100'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 opacity-50 mix-blend-lighten transition duration-500 group-hover:opacity-80" />
                      <img
                        src={FLOOR_IMAGES[floor]}
                        alt={`${FLOOR_LABELS[floor]} floor plan`}
                        className="relative h-full w-full object-contain opacity-90 mix-blend-screen transition duration-500 group-hover:scale-[1.02]"
                        style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.45))' }}
                      />
                      <div className="absolute inset-1 rounded-xl border border-primary/20 opacity-0 transition duration-500 group-hover:opacity-80" />
                      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/40 backdrop-blur">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(250,91,53,0.2)]" />
                        {FLOOR_LABELS[floor]} Floor
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
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

          <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/80 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(250,91,53,0.14),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(250,91,53,0.12),transparent_36%)]" />
            <div className="flex items-center justify-between px-4 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Interactive floor map</p>
                <p className="text-lg font-semibold text-slate-50">{FLOOR_LABELS[selectedFloor]} level</p>
              </div>
              <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-primary/30">
                Tap anywhere to drop a pin
              </span>
            </div>

            <div
              onClick={handleClick}
              className="relative m-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-slate-700/70 bg-slate-950/80 shadow-inner ring-1 ring-slate-800/50 transition hover:border-primary/60 hover:ring-primary/30"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(250,91,53,0.08), rgba(250,91,53,0.04)), url('${FLOOR_IMAGES[selectedFloor]}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'crosshair',
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_45%)] opacity-60" />
              {pin && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-full transform"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <MapPin className="h-10 w-10 text-primary drop-shadow-[0_8px_24px_rgba(250,91,53,0.5)]" />
                  <div className="mt-1 rounded-md bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-slate-100 ring-1 ring-primary/25">
                    {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 text-sm text-slate-200">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Selection</span>
                <span className="font-medium text-slate-50">
                  {pin
                    ? `X ${pin.x.toFixed(1)}% · Y ${pin.y.toFixed(1)}%`
                    : 'Choose a spot on the map to mark the incident'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPin(null)} className="border-slate-700 text-slate-50">
                  Reset
                </Button>
                <Button onClick={handleConfirm} disabled={!pin} className="shadow-[0_0_35px_rgba(250,91,53,0.35)]">
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
