import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api.service';

type SubmitMode = 'identified' | 'anonymous';

interface SubmitReportDialogProps {
  sessionId: string;
  summary?: string;
  defaultMode?: SubmitMode;
  onCancel: () => void;
}

export function SubmitReportDialog({ sessionId, summary, defaultMode = 'identified', onCancel }: SubmitReportDialogProps) {
  const navigate = useNavigate();
  const [submittedBy, setSubmittedBy] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mode, setMode] = useState<SubmitMode>(defaultMode);
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnonymous = mode === 'anonymous';

  const canSubmit = useMemo(() => {
    if (isAnonymous) return true;
    return Boolean(submittedBy.trim());
  }, [isAnonymous, submittedBy]);

  const handleSubmit = async () => {
    if (!isAnonymous && !submittedBy.trim()) {
      setNameError('Please enter your full name to submit identified.');
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await apiService.submitReport({
        sessionId,
        submittedBy: isAnonymous ? undefined : submittedBy.trim(),
        anonymous: isAnonymous,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      navigate(`/report/${report.reportId}`);
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-2xl overflow-hidden border-orange-100/80 bg-white/95 shadow-2xl ring-1 ring-orange-100">
        <div className="border-b border-orange-100/70 bg-gradient-to-r from-orange-50 to-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Submit report</p>
              <p className="text-base font-semibold text-slate-900">Confirm details before sending</p>
              <p className="text-sm text-orange-700/80">Choose how you’d like to share your information.</p>
            </div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200">
              Session {sessionId.slice(-6)}
            </span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {summary ? (
            <div className="rounded-xl border border-orange-100/80 bg-orange-50/50 p-4 text-sm text-orange-900">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">Summary</p>
              <p className="leading-relaxed">{summary}</p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMode('identified');
                setNameError('');
              }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition shadow-sm ${
                mode === 'identified'
                  ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-100'
                  : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'
              }`}
            >
              <span className="mt-1 h-3 w-3 rounded-full border-2 border-orange-500 bg-white" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Submit with name</p>
                <p className="text-xs text-slate-700">We’ll include your name for follow-up if needed.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('anonymous');
                setNameError('');
              }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition shadow-sm ${
                mode === 'anonymous'
                  ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-100'
                  : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'
              }`}
            >
              <span className="mt-1 h-3 w-3 rounded-full border-2 border-orange-500 bg-white" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Submit anonymously</p>
                <p className="text-xs text-slate-700">Your name won’t be shared, but we can still update you.</p>
              </div>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="reporter-name">
                Full name {isAnonymous ? <span className="text-xs text-slate-500">(optional)</span> : null}
              </label>
              <Input
                id="reporter-name"
                placeholder="Enter your full name"
                value={submittedBy}
                disabled={isSubmitting || isAnonymous}
                onChange={(event) => {
                  setSubmittedBy(event.target.value);
                  setNameError('');
                }}
                className="border-orange-200 focus-visible:ring-orange-500"
              />
              {nameError ? <p className="text-xs font-semibold text-red-600">{nameError}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="reporter-phone">
                Phone number <span className="text-xs text-slate-500">(optional)</span>
              </label>
              <Input
                id="reporter-phone"
                placeholder="Enter your phone number"
                type="tel"
                value={phoneNumber}
                disabled={isSubmitting}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="border-orange-200 focus-visible:ring-orange-500"
              />
              <p className="text-xs text-slate-500">We’ll only use this to update you on the report status.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-orange-100/80 bg-orange-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-orange-200 text-orange-700 hover:bg-orange-100/70"
          >
            Go Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_10px_30px_rgba(249,91,53,0.25)] hover:brightness-105"
          >
            {isAnonymous ? 'Submit Anonymously' : 'Submit with Name'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
