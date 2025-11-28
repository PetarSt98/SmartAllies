import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResponderTicket {
  id: string;
  title: string;
  category: 'Human Incident' | 'Facility';
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'To Do';
  reporter: string;
  assignedResponder: string;
  summary: string;
  details: string[];
  location: string;
  image: string;
  avatar?: string;
  victim?: string;
  anonymous?: boolean;
}

const tickets: ResponderTicket[] = [
  {
    id: 'HR-INC-2401',
    title: 'Workplace harassment report – canteen',
    category: 'Human Incident',
    priority: 'High',
    status: 'In Progress',
    reporter: 'David (HR partner)',
    victim: 'Anna R.',
    assignedResponder: 'John Allen',
    summary: 'Anna reported uncomfortable comments about her outfit in the canteen. Immediate follow-up is required.',
    details: [
      'Meet with Anna to clarify what was said, who was involved, and identify the culprit.',
      'Review any nearby CCTV availability and speak with witnesses who were present.',
      'Coordinate with HR for guidance on confidentiality and next steps.',
    ],
    location: 'Gland HQ – Ground-floor canteen',
    image: '/images/responder/hr-marie.png',
    avatar: '/images/responder/hr-marie.png',
  },
  {
    id: 'FAC-TOI-310',
    title: 'Cracked toilet tank on 3rd floor',
    category: 'Facility',
    priority: 'Medium',
    status: 'To Do',
    reporter: 'Anonymous',
    assignedResponder: 'John Allen',
    summary: 'Leaking crack reported on toilet tank near stairwell restroom. Needs inspection and containment.',
    details: [
      'Inspect the crack and place a temporary out-of-order sign if water leakage persists.',
      'Notify facilities/maintenance for repair or replacement scheduling.',
      'Check nearby floor drains to ensure no slip hazard forms around the area.',
    ],
    location: '3rd Floor – Restroom by east stairwell',
    image: '/images/responder/cracked-toilet.png',
    anonymous: true,
  },
];

function statusColors(status: ResponderTicket['status']) {
  if (status === 'In Progress') {
    return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-orange-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function priorityChip(priority: ResponderTicket['priority']) {
  const map = {
    High: 'text-red-700 bg-red-50 border-red-200',
    Medium: 'text-amber-700 bg-amber-50 border-amber-200',
    Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  } as const;
  return map[priority];
}

export function ResponderPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/85 px-6 py-5 shadow-xl backdrop-blur-md">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-primary font-semibold">Responder Dashboard</p>
            <h1 className="text-3xl font-bold text-gray-900">Swissquote Incident Service</h1>
            <p className="text-gray-600">Responder ID: 1 &mdash; Active queue for immediate action</p>
          </div>
          <div className="flex items-center gap-5">
            <img src="/images/logo/SQ.svg" alt="Swissquote logo" className="h-12 w-12" />
            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-lg">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-primary flex items-center justify-center text-white font-semibold">
                JA
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">Logged in</p>
                <p className="text-xs text-gray-600">First responder</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden border-orange-100/80 shadow-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-orange-300" />
              <CardHeader className="pb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{ticket.id}</p>
                  <CardTitle className="text-xl text-gray-900">{ticket.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${priorityChip(
                        ticket.priority
                      )}`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Priority: {ticket.priority}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusColors(
                        ticket.status
                      )}`}
                    >
                      {ticket.status === 'In Progress' ? <Clock className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                      {ticket.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      <Shield className="h-4 w-4" />
                      {ticket.category}
                    </span>
                  </div>
                </div>
                {ticket.avatar && (
                  <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/70 px-3 py-2 shadow-md">
                    <img src={ticket.avatar} alt={`${ticket.reporter} avatar`} className="h-12 w-12 rounded-full border border-white/80" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{ticket.reporter}</p>
                      {ticket.victim && <p className="text-xs text-gray-500">Victim: {ticket.victim}</p>}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-inner">
                  <p className="text-gray-800 leading-relaxed">{ticket.summary}</p>
                </div>

                <div className="flex gap-4 items-start">
                  <img
                    src={ticket.image}
                    alt={ticket.title}
                    className="h-28 w-28 rounded-2xl border border-white/80 bg-gray-50 object-cover shadow-md"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Location</p>
                      <p className="text-gray-900">{ticket.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Reporter</p>
                      <p className="text-gray-900">
                        {ticket.anonymous ? 'Anonymous' : ticket.reporter} &bull; Assigned to {ticket.assignedResponder}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Next responder steps</p>
                  <ul className="space-y-2">
                    {ticket.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span className="text-gray-800 leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="default" className="flex-1" disabled={ticket.status === 'In Progress'}>
                    Set In Progress
                  </Button>
                  <Button variant="outline" className="flex-1" disabled={ticket.status === 'To Do'}>
                    Mark Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}