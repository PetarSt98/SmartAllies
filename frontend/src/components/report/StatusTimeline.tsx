import { ReportStatus } from '@/types/report.types';
import { Check } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
}

const STATUSES = [
  { key: ReportStatus.SUBMITTED, label: 'Submitted' },
  { key: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
  { key: ReportStatus.INVESTIGATION, label: 'Investigation' },
  { key: ReportStatus.CLOSED, label: 'Closed' },
];

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-6 h-1 bg-orange-100/80 rounded-full" aria-hidden />
        <div
          className="absolute left-0 top-6 h-1 rounded-full bg-gradient-to-r from-primary to-orange-400"
          style={{ width: `${(currentIndex / (STATUSES.length - 1)) * 100}%` }}
          aria-hidden
        />
        {STATUSES.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.key} className="flex flex-col items-center flex-1 relative">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center z-10 border-2 transition-all duration-200 shadow-md',
                  isActive
                    ? 'bg-gradient-to-br from-primary to-orange-500 border-transparent text-white scale-105'
                    : 'bg-white border-orange-100 text-orange-200'
                )}
              >
                {isActive && index < currentIndex ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-lg font-semibold">{index + 1}</span>
                )}
              </div>

              <p
                className={cn(
                  'mt-2 text-sm font-semibold text-center',
                  isCurrent ? 'text-primary' : isActive ? 'text-slate-700' : 'text-slate-400'
                )}
              >
                {status.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
