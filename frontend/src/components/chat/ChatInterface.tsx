import { useState } from 'react';

import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { SubmitReportDialog } from '@/components/report/SubmitReportDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { IncidentType, WorkflowState } from '@/types/incident.types';

import { ActionButtons } from './ActionButtons';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

type SubmitIntent = 'submit' | 'anonymous' | null;

export function ChatInterface() {
  const { messages, isLoading, currentResponse, sendMessage, sessionId } = useChatWorkflow();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>(null);

  const openSubmitDialog = (intent: SubmitIntent = 'submit') => {
    setSubmitIntent(intent);
    setShowSubmitDialog(true);
  };

  const closeSubmitDialog = () => {
    setShowSubmitDialog(false);
    setSubmitIntent(null);
  };

  const handleActionClick = (action: string) => {
    const lower = action.toLowerCase();

    if (lower.includes('submit anonymously')) {
      openSubmitDialog('anonymous');
      return;
    }

    if (lower.includes('submit')) {
      openSubmitDialog('submit');
      return;
    }

    if (lower.includes('cancel')) {
      sendMessage('Cancel');
      return;
    }

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

  const canSubmit =
    currentResponse?.workflowState === WorkflowState.REPORT_READY &&
    (currentResponse?.incidentType === IncidentType.HUMAN ||
      currentResponse?.incidentType === IncidentType.FACILITY);

  const submitSummary = (currentResponse?.metadata as { summary?: string } | undefined)?.summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 text-slate-900">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(255,179,140,0.25),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(251,120,76,0.22),transparent_32%)]" />

        <header className="flex items-center justify-between rounded-2xl border border-orange-100/70 bg-white/80 px-6 py-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.35)]">
              <img src="/images/logo/SQ.svg" alt="SmartAllies logo" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">SmartAllies</p>
              <h1 className="text-xl font-semibold leading-tight">Incident Reporting Concierge</h1>
              <p className="text-sm text-orange-700/80">Guided assistance, clear visuals, and quick actions.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_0_6px_rgba(74,222,128,0.45)]" />
            Live support
          </div>
        </header>

        <Card className="flex flex-1 flex-col overflow-hidden border-orange-100/80 bg-white/90 shadow-xl ring-1 ring-orange-100">
          <MessageList messages={messages} />

          {showFloorPlan ? (
            <div className="border-y border-orange-100/80 bg-orange-50/40 px-4 py-5">
              <FloorPlanSelector onLocationSelect={handleLocationSelect} />
            </div>
          ) : null}

          <ActionButtons
            response={currentResponse}
            onActionClick={handleActionClick}
            isLoading={isLoading}
          />

          {canSubmit ? (
            <div className="border-t border-orange-100/80 bg-gradient-to-r from-orange-50/70 via-white to-orange-50/70 px-4 py-5">
              <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-orange-800">Your report is ready to submit</p>
                  <p className="text-xs text-orange-700/80">
                    Confirm the details or send anonymously. You can always cancel if you need to edit.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => sendMessage('Cancel')}
                    className="border-orange-200 text-orange-700 hover:bg-orange-100/70"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openSubmitDialog('anonymous')}
                    className="border-orange-200 bg-orange-50/60 text-orange-700 hover:bg-orange-100/70"
                  >
                    Submit Anonymously
                  </Button>
                  <Button
                    onClick={() => openSubmitDialog('submit')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.25)] hover:brightness-105"
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
        </Card>
      </div>

      {showSubmitDialog ? (
        <SubmitReportDialog
          sessionId={sessionId}
          summary={submitSummary}
          defaultMode={submitIntent === 'anonymous' ? 'anonymous' : 'identified'}
          onCancel={closeSubmitDialog}
        />
      ) : null}
    </div>
  );
}
