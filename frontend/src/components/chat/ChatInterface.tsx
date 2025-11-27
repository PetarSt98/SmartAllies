import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ActionButtons } from './ActionButtons';
import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { IncidentType } from '@/types/incident.types';
import { Card } from '@/components/ui/card';

export function ChatInterface() {
  const { messages, isLoading, currentResponse, sendMessage } = useChatWorkflow();

  const handleActionClick = (action: string) => {
    sendMessage(action);
  };

  const handleLocationSelect = (location: string) => {
    sendMessage(location);
  };

  const showFloorPlan =
    currentResponse?.incidentType === IncidentType.FACILITY &&
    currentResponse?.metadata?.requiredFields &&
    Array.isArray(currentResponse.metadata.requiredFields) &&
    (currentResponse.metadata.requiredFields as string[]).includes('where');

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">SmartAllies Incident Reporting</h1>
      </header>

      <Card className="flex-1 flex flex-col m-4 overflow-hidden">
        <MessageList messages={messages} />

        {showFloorPlan ? (
          <div className="p-4 border-t">
            <FloorPlanSelector onLocationSelect={handleLocationSelect} />
          </div>
        ) : null}

        <ActionButtons
          response={currentResponse}
          onActionClick={handleActionClick}
          isLoading={isLoading}
        />

        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </Card>
    </div>
  );
}
