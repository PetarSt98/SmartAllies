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
    <div className="border-t p-4 bg-gray-50">
      <div className="flex flex-wrap gap-2 justify-center">
        {response.suggestedActions.map((action) => (
          <Button
            key={action}
            onClick={() => onActionClick(action)}
            disabled={isLoading}
            variant="outline"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
