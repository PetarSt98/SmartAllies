import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
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

const FLOORS: Array<{
  id: Floor;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  { id: 'third', label: '3rd Floor', shortLabel: '3F', description: 'Executive, client lounge' },
  { id: 'second', label: '2nd Floor', shortLabel: '2F', description: 'Product teams, labs' },
  { id: 'first', label: '1st Floor', shortLabel: '1F', description: 'Design, marketing' },
  { id: 'ground', label: 'Ground', shortLabel: 'G', description: 'Reception, collaboration' },
  { id: 'minusOne', label: '-1', shortLabel: '-1', description: 'Operations, storage' },
  { id: 'minusTwo', label: '-2', shortLabel: '-2', description: 'Mechanical, service' },
  { id: 'minusThree', label: '-3', shortLabel: '-3', description: 'Parking & access' },
];

const FLOOR_IMAGES: Record<Floor, string> = {
  minusThree: '/images/floor-plans/minus-three.svg',
  minusTwo: '/images/floor-plans/minus-two.svg',
  minusOne: '/images/floor-plans/minus-one.svg',
  ground: '/images/floor-plans/ground-floor.svg',
  first: '/images/floor-plans/first-floor.svg',
  second: '/images/floor-plans/second-floor.svg',
  third: '/images/floor-plans/third-floor.svg',
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
        `Floor plan location: ${selectedFloorMeta.label}, X: ${pin.x.toFixed(1)}%, Y: ${pin.y.toFixed(1)}%`
      );
    }
  };

  const handleFloorChange = (floor: Floor) => {
    setSelectedFloor(floor);
    setPin(null);
  };

  const selectedFloorMeta = useMemo(
    () => FLOORS.find((floor) => floor.id === selectedFloor) ?? FLOORS[0],
    [selectedFloor]
  );

  return (
    <Card className="w-full border-slate-800/70 bg-slate-900/70 text-slate-100 shadow-2xl backdrop-blur">
      <CardHeader className="flex flex-col gap-2 pb-2">
        <div className="flex items-center gap-2 text-sm text-indigo-200/80">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-indigo-200/80">Facilities</span>
        </div>
        <CardTitle className="text-2xl font-semibold text-white">Select where the incident happened</CardTitle>
        <p className="text-sm text-slate-300">
          Explore the stacked floors, pick the correct level, then drop a pin directly on the map.
        </p>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="relative h-80 w-full [perspective:1600px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-72 w-full max-w-md">
                {[...FLOORS].reverse().map((floor, idx) => {
                  const depthIndex = FLOORS.length - idx;
                  const isActive = floor.id === selectedFloor;
                  const offsetFromActive = FLOORS.findIndex((f) => f.id === selectedFloor) -
                    FLOORS.findIndex((f) => f.id === floor.id);

                  const translateZ = depthIndex * 22;
                  const translateY = offsetFromActive * -12;
                  const tilt = isActive ? 46 : 52;
                  const scale = isActive ? 1.03 : 0.97;

                  return (
                    <button
                      key={floor.id}
                      onClick={() => handleFloorChange(floor.id)}
                      className="group absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-2xl transition duration-300 hover:border-indigo-400/40 hover:shadow-[0_25px_70px_rgba(99,102,241,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      style={{
                        transform: `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${tilt}deg) rotateZ(-16deg) scale(${scale})`,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Floor</p>
                          <p className="text-lg font-semibold text-white">{floor.label}</p>
                          <p className="text-xs text-slate-300/80">{floor.description}</p>
                        </div>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold transition ${
                            isActive
                              ? 'bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/40'
                              : 'bg-white/5 text-slate-200'
                          }`}
                        >
                          {floor.shortLabel}
                        </div>
                      </div>
                      <div className="mt-3 h-[3px] w-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-300 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FLOORS.map((floor) => (
              <Button
                key={floor.id}
                variant={selectedFloor === floor.id ? 'default' : 'outline'}
                className="rounded-full border-indigo-500/30 bg-indigo-500/10 text-sm text-indigo-100 hover:bg-indigo-500/20"
                onClick={() => handleFloorChange(floor.id)}
              >
                {floor.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/70">Active level</p>
              <p className="text-xl font-semibold text-white">{selectedFloorMeta.label}</p>
              <p className="text-sm text-slate-300">{selectedFloorMeta.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Interactive map ready
            </div>
          </div>

          <div
            onClick={handleClick}
            className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 shadow-inner transition hover:border-indigo-300/60"
            style={{
              backgroundImage: `url('${FLOOR_IMAGES[selectedFloor]}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.2),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {pin && (
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-full"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <MapPin className="h-9 w-9 text-cyan-300 drop-shadow-[0_10px_35px_rgba(56,189,248,0.45)]" />
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Selection</p>
              {pin ? (
                <p className="font-medium text-white">
                  X: {pin.x.toFixed(1)}%, Y: {pin.y.toFixed(1)}% on {selectedFloorMeta.label}
                </p>
              ) : (
                <p className="text-slate-300">Tap anywhere on the map to drop your incident pin.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setPin(null)}
              >
                Reset
              </Button>
              <Button
                disabled={!pin}
                className="bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/25 disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600"
                onClick={handleConfirm}
              >
                Confirm location
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
