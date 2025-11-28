import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusTimeline } from './StatusTimeline';
import { apiService } from '@/services/api.service';
import type { IncidentReport } from '@/types/report.types';
import { MapPin, Calendar, User, FileText, Shield } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100/40">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100/40">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Report not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/40 py-10">
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-orange-300/50 blur-3xl" />

        <header className="relative mb-8 flex flex-col gap-3 rounded-3xl border border-orange-100/80 bg-white/80 px-6 py-5 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Incident Report</p>
              <h1 className="text-3xl font-bold text-slate-900">Review submission</h1>
            </div>
          </div>
          <p className="text-slate-600">Report ID: {report.reportId}</p>
        </header>

        <Card className="relative mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Report Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={report.status} />
          </CardContent>
        </Card>

        <Card className="relative mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Type</p>
                <p className="text-slate-900">{report.incidentType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Description</p>
                <p className="text-slate-900">{report.description}</p>
              </div>
            </div>

            {report.location && (
              <div className="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">Location</p>
                  <p className="text-slate-900">{report.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Submitted By</p>
                <p className="text-slate-900">
                  {report.anonymous ? 'Anonymous' : report.submittedBy}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Submitted At</p>
                <p className="text-slate-900">
                  {new Date(report.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {report.details && Object.keys(report.details).length > 0 && (
          <Card className="relative mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 md:grid-cols-2">
                {Object.entries(report.details).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-orange-100/80 bg-white/80 px-4 py-3 shadow-sm"
                  >
                    <dt className="font-medium text-slate-700 capitalize">{key}</dt>
                    <dd className="text-slate-900 mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {report.imageUrl && (
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-lg">Attached Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={report.imageUrl}
                alt="Incident"
                className="w-full rounded-2xl border border-orange-100/80 shadow-lg"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
