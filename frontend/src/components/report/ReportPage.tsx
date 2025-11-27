import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusTimeline } from './StatusTimeline';
import { apiService } from '@/services/api.service';
import type { IncidentReport } from '@/types/report.types';
import { MapPin, Calendar, User, FileText } from 'lucide-react';

export function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
    }
  }, [reportId]);

  const loadReport = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiService.getReport(id);
      setReport(data);
    } catch (err) {
      setError('Failed to load report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Report not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Incident Report</h1>
          <p className="text-gray-600 mt-2">Report ID: {report.reportId}</p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={report.status} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Type</p>
                <p className="text-gray-900">{report.incidentType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{report.description}</p>
              </div>
            </div>

            {report.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-900">{report.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Submitted By</p>
                <p className="text-gray-900">
                  {report.anonymous ? 'Anonymous' : report.submittedBy}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Submitted At</p>
                <p className="text-gray-900">
                  {new Date(report.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {report.details && Object.keys(report.details).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {Object.entries(report.details).map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-medium text-gray-700 capitalize">{key}</dt>
                    <dd className="text-gray-900 mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {report.imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Attached Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={report.imageUrl}
                alt="Incident"
                className="w-full rounded-lg"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
