import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api.service';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Submit Incident Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (optional)
            </label>
            <Input
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Enter your name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (optional)
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              type="tel"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
