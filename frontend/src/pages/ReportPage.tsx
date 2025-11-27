import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ReportPage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');

  const handleStartNew = () => {
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 text-slate-900">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(255,179,140,0.25),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(251,120,76,0.22),transparent_32%)]" />

        <header className="flex items-center justify-between rounded-2xl border border-orange-100/70 bg-white/80 px-6 py-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.35)]">
              <img src="/images/logo/SQ.svg" alt="SmartAllies logo" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">SmartAllies</p>
              <h1 className="text-xl font-semibold leading-tight">Report submitted</h1>
              <p className="text-sm text-orange-700/80">We received your details and will follow up shortly.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_0_6px_rgba(74,222,128,0.45)]" />
            Confirmation
          </div>
        </header>

        <Card className="overflow-hidden border-orange-100/80 bg-white/90 shadow-xl ring-1 ring-orange-100">
          <div className="border-b border-orange-100/80 bg-gradient-to-r from-orange-50 to-white px-6 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Report summary</p>
                <p className="text-base font-semibold text-slate-900">Thank you for submitting your incident report.</p>
              </div>
              {sessionId ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200">
                  Session
                  <span className="rounded-full bg-white px-2 py-0.5 text-orange-700 shadow-inner ring-1 ring-orange-200">{sessionId}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-5 px-6 py-6 text-sm text-slate-800">
            <p>
              Our team has your information and will reach out if more details are needed. You can keep this page as your
              confirmation, or start a new report anytime.
            </p>
            <div className="rounded-xl border border-orange-100/80 bg-orange-50/60 px-4 py-3 text-orange-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Need to add something else?</p>
              <p className="mt-1 text-sm text-orange-800/90">Reply to the original chat or open a fresh report below.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-orange-100/80 bg-orange-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-orange-200 text-orange-700 hover:bg-orange-100/70"
            >
              Back to chat
            </Button>
            <Button
              onClick={handleStartNew}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.25)] hover:brightness-105"
            >
              Start a new report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportPage;
