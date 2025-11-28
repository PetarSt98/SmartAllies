import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api.service';
import { ShieldCheck, User, Phone } from 'lucide-react';

interface SubmitReportDialogProps {
  sessionId: string;
  onCancel: () => void;
}

export function SubmitReportDialog({ sessionId, onCancel }: SubmitReportDialogProps) {
  const navigate = useNavigate();
  const [submittedBy, setSubmittedBy] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (anonymous: boolean) => {
    setIsSubmitting(true);
    try {
      const report = await apiService.submitReport({
        sessionId,
        submittedBy: anonymous ? undefined : submittedBy,
        anonymous,
        phoneNumber: phoneNumber || undefined,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-orange-100 shadow-2xl">
        <CardHeader className="flex-row items-center gap-3 border-b border-orange-100/70 bg-gradient-to-r from-orange-50/80 to-white rounded-t-2xl">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Finalize your report</p>
            <CardTitle className="text-xl">Submit Incident Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Your Name (optional)
            </label>
            <Input
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Enter your name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Phone Number (optional)
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              type="tel"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Submit Anonymously
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !submittedBy.trim()}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
