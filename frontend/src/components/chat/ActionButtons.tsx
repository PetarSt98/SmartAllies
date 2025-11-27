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
    <div className="border-t border-orange-100/80 bg-white/85 px-4 py-5">
      <div className="flex flex-wrap justify-center gap-3">
        {response.suggestedActions.map((action) => (
          <Button
            key={action}
            onClick={() => onActionClick(action)}
            disabled={isLoading}
            variant="outline"
            className="rounded-full border-orange-200 bg-orange-50/40 text-orange-700 hover:bg-orange-100/70"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
