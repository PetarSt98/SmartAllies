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

          <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
        </Card>
      </div>
    </div>
  );
}
