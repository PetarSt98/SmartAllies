import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useChatWorkflow } from '@/hooks/useChatWorkflow';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ActionButtons } from './ActionButtons';
import { FloorPlanSelector } from '@/components/floor-plan/FloorPlanSelector';
import { IncidentType, WorkflowState } from '@/types/incident.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SubmitIntent = 'submit' | 'anonymous' | null;

export function ChatInterface() {
  const { messages, isLoading, currentResponse, sendMessage, sessionId } = useChatWorkflow();
  const navigate = useNavigate();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>(null);
  const [fullName, setFullName] = useState('');
  const [nameError, setNameError] = useState('');

  const redirectToReportPage = () => {
    const url = `/report?sessionId=${encodeURIComponent(sessionId)}`;
    navigate(url);
  };

  const openSubmitDialog = (intent: SubmitIntent = 'submit') => {
    setSubmitIntent(intent);
    setShowSubmitDialog(true);
    setNameError('');
  };

  const closeSubmitDialog = () => {
    setShowSubmitDialog(false);
    setSubmitIntent(null);
    setFullName('');
    setNameError('');
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

  const handleConfirmSubmit = async () => {
    if (submitIntent === 'anonymous') {
      await sendMessage('Submit Anonymously');
      redirectToReportPage();
      closeSubmitDialog();
      return;
    }

    if (!fullName.trim()) {
      setNameError('Please provide your full name to submit.');
      return;
    }

    await sendMessage('Submit');
    await sendMessage(fullName.trim());
    redirectToReportPage();
    closeSubmitDialog();
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-orange-100/80 bg-white/95 shadow-2xl">
            <div className="border-b border-orange-100/70 bg-gradient-to-r from-orange-50 to-white px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Submit report</p>
                  <p className="text-base font-semibold text-slate-900">Confirm details before sending</p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200">
                  Session {sessionId.slice(-6)}
                </span>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              {submitSummary ? (
                <div className="rounded-xl border border-orange-100/80 bg-orange-50/50 p-3 text-sm text-orange-900">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">Summary</p>
                  <p className="leading-relaxed">{submitSummary}</p>
                </div>
              ) : null}

              {submitIntent === 'submit' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900" htmlFor="reporter-name">
                    Full name
                  </label>
                  <Input
                    id="reporter-name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setNameError('');
                    }}
                    className="border-orange-200 focus-visible:ring-orange-500"
                  />
                  {nameError ? <p className="text-xs font-semibold text-red-600">{nameError}</p> : null}
                </div>
              ) : (
                <div className="rounded-xl border border-orange-100/80 bg-orange-50/60 px-3 py-2 text-sm text-orange-800">
                  This report will be sent without your name.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-orange-100/80 bg-orange-50/60 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={closeSubmitDialog}
                className="border-orange-200 text-orange-700 hover:bg-orange-100/70"
              >
                Go Back
              </Button>
              {submitIntent === 'submit' ? (
                <Button
                  onClick={handleConfirmSubmit}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.25)] hover:brightness-105"
                >
                  Submit with Name
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmSubmit}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.25)] hover:brightness-105"
                >
                  Submit Anonymously
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
