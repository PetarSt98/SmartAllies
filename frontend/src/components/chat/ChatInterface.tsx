import { useState } from 'react';
import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ActionButtons } from './ActionButtons';
import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { SubmitReportDialog } from '@/components/report/SubmitReportDialog';
import { IncidentType, WorkflowState } from '@/types/incident.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ChatInterface() {
  const { messages, isLoading, currentResponse, sendMessage, sessionId } = useChatWorkflow();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const handleActionClick = (action: string) => {
    if (action.toLowerCase().includes('submit')) {
      setShowSubmitDialog(true);
    } else {
      sendMessage(action);
    }
  };

  const handleLocationSelect = (location: string) => {
    sendMessage(location);
  };

  const showFloorPlan =
    currentResponse?.incidentType === IncidentType.FACILITY &&
    currentResponse?.metadata?.requiredFields &&
    Array.isArray(currentResponse.metadata.requiredFields) &&
    (currentResponse.metadata.requiredFields as string[]).includes('where');

  const canSubmit =
    currentResponse?.workflowState === WorkflowState.REPORT_READY &&
    (currentResponse?.incidentType === IncidentType.HUMAN ||
      currentResponse?.incidentType === IncidentType.FACILITY);

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

        {canSubmit && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => sendMessage('Cancel')}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => setShowSubmitDialog(true)}>
                Submit Anonymously
              </Button>
              <Button onClick={() => setShowSubmitDialog(true)}>
                Submit Report
              </Button>
            </div>
          </div>
        )}

        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </Card>

      {showSubmitDialog && (
        <SubmitReportDialog
          sessionId={sessionId}
          onCancel={() => setShowSubmitDialog(false)}
        />
      )}
    </div>
  );
}
