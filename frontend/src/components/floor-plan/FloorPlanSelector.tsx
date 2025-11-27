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

  const handlePinDrop = (e: MouseEvent<HTMLElement>) => {
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
        const layerOffset = index * 16;
        const depth = index * 32;
        const isActive = activeFloor === floor;
        const isSelected = selectedFloor === floor;

        return {
          floor,
          depth,
          layerOffset,
          isActive,
          isSelected,
        };
      }),
    [activeFloor, selectedFloor]
  );

  return (
    <Card className="w-full border border-orange-200/60 bg-gradient-to-br from-white via-orange-50 to-white text-slate-900 shadow-xl ring-1 ring-orange-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <MapPin className="h-5 w-5" />
          </span>
          Map the incident on our 3D campus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-white/70 p-4 shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,156,114,0.18),transparent_45%),radial-gradient(circle_at_80%_8%,rgba(255,122,89,0.12),transparent_42%)]" />
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-orange-500">Facilities</p>
              <p className="text-base font-semibold text-slate-900">Tap a floor, then drop the pin</p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700 ring-1 ring-orange-200">Hover to preview · Tap to select</span>
          </div>

          <div
            className="relative mx-auto aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-[24px] border border-orange-200 bg-gradient-to-b from-white via-orange-50/40 to-white"
            style={{ perspective: '2000px' }}
          >
            <div className="absolute inset-5 rounded-3xl bg-gradient-to-b from-orange-100/40 via-white to-orange-50/50 blur-3xl" aria-hidden />
            <div
              className="relative h-full w-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(54deg) rotateZ(-6deg) translateZ(-180px)',
              }}
            >
              {stackLayers.map(({ floor, depth, layerOffset, isActive, isSelected }, index) => {
                const lift = isActive ? 46 : 0;
                const pushAway = isSelected || isActive ? 0 : 18;

                return (
                  <button
                    key={floor}
                    type="button"
                    onMouseEnter={() => setHoveredFloor(floor)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={(e) => {
                      if (selectedFloor === floor) {
                        handlePinDrop(e);
                      } else {
                        handleFloorChange(floor);
                      }
                    }}
                    aria-pressed={selectedFloor === floor}
                    className="group absolute inset-0"
                    style={{
                      transform: `translateY(-${layerOffset + pushAway}px) translateZ(${depth + lift}px) scale(${1 - index * 0.02})`,
                      transformStyle: 'preserve-3d',
                      zIndex: FLOOR_STACK_ORDER.length - index,
                      transition: 'transform 420ms ease, filter 420ms ease, opacity 320ms ease',
                    }}
                  >
                    <div
                      className={`relative h-full w-full overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(255,128,91,0.25)] transition duration-500 ease-out ${
                        isActive
                          ? 'border-orange-300/90 ring-2 ring-orange-400/70 scale-[1.02]'
                          : 'border-orange-100/80 opacity-50 hover:opacity-95'
                      } ${isSelected ? 'bg-white/80' : 'bg-white/60'}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/30 to-orange-50/50 opacity-80 transition duration-500 group-hover:opacity-95" />
                      <img
                        src={FLOOR_IMAGES[floor]}
                        alt={`${FLOOR_LABELS[floor]} floor plan`}
                        className="relative h-full w-full object-contain opacity-90 transition duration-500 group-hover:scale-[1.03]"
                        style={{ filter: 'drop-shadow(0 12px 30px rgba(255,128,91,0.22))' }}
                      />
                      <div className="absolute inset-1 rounded-xl border border-orange-200/70 opacity-0 transition duration-500 group-hover:opacity-100" />
                      <div className={`pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${isActive ? 'bg-orange-500 text-white ring-orange-500/70' : 'bg-white/85 text-orange-700 ring-orange-200'}`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_5px_rgba(255,163,128,0.5)]" />
                        {FLOOR_LABELS[floor]} Floor
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {pin && (
              <div
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 transform drop-shadow-xl"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <MapPin className="h-10 w-10 text-orange-600 drop-shadow-[0_10px_30px_rgba(255,138,101,0.55)]" />
                <div className="mt-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-slate-900 ring-1 ring-orange-200">
                  {pin.x.toFixed(1)}%, {pin.y.toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FLOOR_STACK_ORDER.map((floor) => (
                <Button
                  key={floor}
                  size="sm"
                  variant={selectedFloor === floor ? 'default' : 'outline'}
                  className={`rounded-full text-xs ${selectedFloor === floor ? 'bg-orange-500 text-white shadow-[0_10px_30px_rgba(255,138,101,0.35)]' : 'border-orange-200 text-orange-700'}`}
                  onClick={() => handleFloorChange(floor)}
                >
                  {FLOOR_LABELS[floor]}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="font-semibold text-orange-700">{FLOOR_LABELS[selectedFloor]}</span>
                <span className="text-xs uppercase tracking-[0.15em] text-orange-500">active</span>
              </div>
              {hoveredFloor && hoveredFloor !== selectedFloor && (
                <span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-700 ring-1 ring-orange-200">
                  previewing {FLOOR_LABELS[hoveredFloor]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-800">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.18em] text-orange-500">Selection</span>
            <span className="font-medium text-slate-900">
              {pin ? `X ${pin.x.toFixed(1)}% · Y ${pin.y.toFixed(1)}% on ${FLOOR_LABELS[selectedFloor]}` : 'Tap the highlighted floor to drop your pin'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPin(null)} className="border-orange-200 text-orange-700">
              Reset
            </Button>
            <Button onClick={handleConfirm} disabled={!pin} className="bg-orange-500 text-white shadow-[0_0_35px_rgba(255,138,101,0.35)] hover:bg-orange-600">
              Confirm location
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
