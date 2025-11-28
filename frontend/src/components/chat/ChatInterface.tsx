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
import { ShieldCheck, Sparkles, Clock } from 'lucide-react';

export function ChatInterface() {
  const { messages, isLoading, currentResponse, sendMessage, sessionId } =
    useChatWorkflow();
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="glow-dot w-80 h-80 bg-orange-200/70 -left-8 top-10" />
      <div className="glow-dot w-72 h-72 bg-orange-400/40 right-2 top-24" />
      <div className="glow-dot w-96 h-96 bg-orange-300/30 -right-10 bottom-10" />

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
              <Sparkles className="h-4 w-4" /> Modernized experience
            </span>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                SmartAllies Incident Desk
              </h1>
              <p className="text-slate-600 max-w-2xl">
                Report incidents with confidence in a refined, calm environment. Your safety
                desk responds instantly and guides you through every step.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-lg border border-orange-100/80 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Active session
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {sessionId.slice(0, 8)} ...
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="flex flex-col h-[78vh] lg:h-[82vh] overflow-hidden border-orange-100/90 shadow-orange-200/60">
            <div className="flex flex-col gap-2 border-b border-orange-100/80 bg-gradient-to-r from-orange-50/80 to-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-inner flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Assistant is ready</p>
                    <p className="text-base font-semibold text-slate-900">Tell us what happened</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-4 w-4" />
                  Real-time guidance
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Use the quick actions or type your details. You can attach images and pinpoint
                locations directly on the floor plan when prompted.
              </p>
            </div>

            <MessageList messages={messages} />

            {showFloorPlan ? (
              <div className="px-6 pb-4">
                <FloorPlanSelector onLocationSelect={handleLocationSelect} />
              </div>
            ) : null}

            <ActionButtons
              response={currentResponse}
              onActionClick={handleActionClick}
              isLoading={isLoading}
            />

            {canSubmit && (
              <div className="border-t border-orange-100/80 px-6 py-4 bg-white/80 backdrop-blur">
                <div className="flex flex-wrap gap-3 justify-center">
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

          <div className="space-y-4">
            <Card className="h-full border-orange-100/80">
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Guided assistance</h2>
                <p className="text-slate-600">
                  Each response adapts to what you share. Expect tailored follow-ups, quick action
                  buttons, and visual tools to keep reporting smooth and focused.
                </p>
                <div className="grid gap-3">
                  {["Fast suggested actions", "Attach evidence instantly", "Floor plan precision"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-orange-100/80 bg-orange-50/60 px-4 py-3 text-sm text-slate-800"
                    >
                      <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-inner">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {showSubmitDialog && (
        <SubmitReportDialog
          sessionId={sessionId}
          onCancel={() => setShowSubmitDialog(false)}
        />
      )}
    </div>
  );
}
