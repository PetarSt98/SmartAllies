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
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {STATUSES.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.key} className="flex flex-col items-center flex-1 relative">
              {index < STATUSES.length - 1 && (
                <div
                  className={cn(
                    'absolute left-1/2 top-6 h-0.5 w-full',
                    isActive ? 'bg-primary' : 'bg-gray-300'
                  )}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
              
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center z-10 border-2 transition-colors',
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-400'
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
                  'mt-2 text-sm font-medium text-center',
                  isCurrent ? 'text-primary' : isActive ? 'text-gray-700' : 'text-gray-400'
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
