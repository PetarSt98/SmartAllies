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
    <div className="border-t border-orange-100/80 px-6 py-4 bg-white/80 backdrop-blur">
      <div className="flex flex-wrap gap-2 justify-center">
        {response.suggestedActions.map((action) => (
          <Button
            key={action}
            onClick={() => onActionClick(action)}
            disabled={isLoading}
            variant="outline"
            className="rounded-full border-orange-200/80 px-4 py-2 text-sm font-semibold hover:bg-orange-100/60"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
