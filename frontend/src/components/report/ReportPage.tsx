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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/85 px-6 py-5 shadow-xl backdrop-blur-md">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary font-semibold">Report ID: {report.reportId}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Incident Report</h1>
            <p className="text-gray-600 mt-1">Submitted {new Date(report.submittedAt).toLocaleString()}</p>
          </div>
          <img src="/images/logo/SQ.svg" alt="SmartAllies logo" className="h-12 w-12" />
        </header>

        <Card className="mb-2 overflow-hidden border-orange-100/80 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300" />
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Report Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={report.status} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-orange-100/80 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-orange-300 via-white to-orange-100" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700">Type</p>
                <p className="text-gray-900">{report.incidentType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700">Description</p>
                <p className="text-gray-900 leading-relaxed">{report.description}</p>
              </div>
            </div>

            {report.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-700">Location</p>
                  <p className="text-gray-900">{report.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700">Submitted By</p>
                <p className="text-gray-900">
                  {report.anonymous ? 'Anonymous' : report.submittedBy}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700">Submitted At</p>
                <p className="text-gray-900">
                  {new Date(report.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {report.details && Object.keys(report.details).length > 0 && (
          <Card className="overflow-hidden border-orange-100/80 shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {Object.entries(report.details).map(([key, value]) => (
                  <div key={key}>
                    <dt className="font-semibold text-gray-700 capitalize">{key}</dt>
                    <dd className="text-gray-900 mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {report.imageUrl && (
          <Card className="overflow-hidden border-orange-100/80 shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-orange-300 via-white to-orange-100" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Attached Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={report.imageUrl}
                alt="Incident"
                className="w-full rounded-2xl border border-white/80 shadow-md"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
