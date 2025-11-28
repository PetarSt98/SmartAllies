import { Button } from '@/components/ui/button';
import type { ChatResponse } from '@/types/incident.types';

interface ActionButtonsProps {
  response: ChatResponse | null;
  onActionClick: (action: string) => void;
  isLoading: boolean;
}

export function ActionButtons({
  response,
  onActionClick,
  isLoading,
}: ActionButtonsProps) {
  if (!response?.suggestedActions || response.suggestedActions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-orange-100/70 p-5 pb-24 sm:pb-8 bg-white/60 backdrop-blur">
      <div className="flex flex-wrap gap-3 justify-center pb-4">
        {response.suggestedActions.map((action) => (
          <Button
            key={action}
            onClick={() => onActionClick(action)}
            disabled={isLoading}
            variant="outline"
            className="rounded-full px-4 py-2 shadow-sm"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
