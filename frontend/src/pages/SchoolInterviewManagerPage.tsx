import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarPlus, Clock, MapPin,
  CheckCircle, XCircle, Bell, Search, X, AlertTriangle,
  FileText,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { schoolAdminService, type SchoolInterview, type SchoolApplicant, type TicketStatus } from '@/lib/api';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type ViewMode = 'month' | 'week' | 'day';
type InterviewStatus = 'confirmed' | 'attended' | 'no_show';

interface InterviewWithApp {
  ticket: {
    id: string;
    ticketNumber: string;
    studentName: string;
    interviewDate: string; // YYYY-MM-DD
    interviewTime: string;
    venue: string;
  };
  application: { formType: string };
  status: InterviewStatus;
}

interface EligibleApplicant {
  id: string;
  studentName: string;
  submissionId: string;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const statusColors: Record<InterviewStatus, string> = {
  confirmed: 'bg-blue-400',
  attended: 'bg-green-500',
  no_show: 'bg-gray-400',
};

const statusLabels: Record<InterviewStatus, string> = {
  confirmed: 'Confirmed',
  attended: 'Attended',
  no_show: 'No Show',
};

const deriveStatus = (s: TicketStatus): InterviewStatus =>
  s === 'used' ? 'attended' : s === 'cancelled' || s === 'expired' ? 'no_show' : 'confirmed';

const toBackendStatus = (s: InterviewStatus): string =>
  s === 'attended' ? 'used' : s === 'no_show' ? 'cancelled' : 'valid';

const toView = (t: SchoolInterview): InterviewWithApp => ({
  ticket: {
    id: t.id,
    ticketNumber: t.ticketNumber,
    studentName: `${t.studentProfile.firstName} ${t.studentProfile.lastName}`,
    interviewDate: new Date(t.interviewDate).toISOString().slice(0, 10),
    interviewTime: t.interviewTime,
    venue: t.room ? `${t.venue}, Room ${t.room}` : t.venue,
  },
  application: { formType: t.application.formType },
  status: deriveStatus(t.status),
});

const formTypeLabel = (ft: string) => ft.charAt(0).toUpperCase() + ft.slice(1);
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDayLabel = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
const formatMonthYear = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
];

const venues = ['Main Campus - Admin Block', 'Primary Wing', 'Administrative Block', 'Science Block'];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

/* ── Schedule Interview Modal ──────────────────────────────────────────────── */

const ScheduleModal: React.FC<{
  open: boolean;
  onClose: () => void;
  applicants: EligibleApplicant[];
  existingInterviews: InterviewWithApp[];
  onSchedule: (payload: {
    applicationId: string;
    interviewDate: string;
    interviewTime: string;
    venue: string;
    room?: string;
    instructions?: string;
  }) => Promise<void>;
}> = ({ open, onClose, applicants, existingInterviews, onSchedule }) => {
  const [studentQuery, setStudentQuery] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedApp, setSelectedApp] = useState<EligibleApplicant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const filteredApps = useMemo(() => {
    if (!studentQuery) return applicants;
    const q = studentQuery.toLowerCase();
    return applicants.filter((a) => a.studentName.toLowerCase().includes(q));
  }, [applicants, studentQuery]);

  const conflicts = useMemo(() => {
    if (!date || !time || !venue) return [];
    return existingInterviews.filter(
      (ei) => ei.ticket.interviewDate === date && ei.ticket.interviewTime === time && ei.ticket.venue.includes(venue)
    );
  }, [date, time, venue, existingInterviews]);

  const hasConflict = conflicts.length > 0;

  const reset = () => {
    setStudentQuery(''); setDate(''); setTime(''); setVenue(''); setRoom(''); setNotes('');
    setSelectedApp(null); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !date || !time || !venue) return;
    setError('');
    setSubmitting(true);
    try {
      await onSchedule({
        applicationId: selectedApp.id,
        interviewDate: date,
        interviewTime: time,
        venue,
        room: room || undefined,
        instructions: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        reset();
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }}>
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>

            {success ? (
              <motion.div className="flex flex-col items-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
                  <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Interview Scheduled!</h3>
                <p className="text-center text-sm text-gray-500">The applicant has been notified.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="mb-1 text-xl font-semibold text-gray-900">Schedule Interview</h2>
                <p className="mb-5 text-sm text-gray-500">Create a new interview slot for a paid applicant.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Applicant</label>
                    {!selectedApp ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={studentQuery}
                          onChange={(e) => setStudentQuery(e.target.value)}
                          placeholder="Search applicant..."
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                        {filteredApps.length > 0 && studentQuery && (
                          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {filteredApps.map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => { setSelectedApp(app); setStudentQuery(app.studentName); }}
                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-violet-50"
                              >
                                <span className="font-medium text-gray-900">{app.studentName}</span>
                                <span className="text-xs text-gray-400">{app.submissionId}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5">
                        <span className="text-sm font-medium text-violet-900">{selectedApp.studentName}</span>
                        <button type="button" onClick={() => { setSelectedApp(null); setStudentQuery(''); }} className="text-violet-600 hover:text-violet-800"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Time Slot</label>
                      <select value={time} onChange={(e) => setTime(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                        <option value="">Select Time</option>
                        {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Venue</label>
                      <select value={venue} onChange={(e) => setVenue(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                        <option value="">Select Venue</option>
                        {venues.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Room</label>
                      <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. 203" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {hasConflict && (
                      <motion.div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Schedule Conflict</p>
                          <p className="text-amber-700">{conflicts[0].ticket.venue} is already booked at {time} by <strong>{conflicts[0].ticket.studentName}</strong>.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Instructions <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" placeholder="Any special instructions..." />
                  </div>

                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={!selectedApp || !date || !time || !venue || submitting} className="flex-1 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(139,92,246,0.3)] transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? 'Scheduling…' : 'Schedule Interview'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Calendar Cell Dot ─────────────────────────────────────────────────────── */

const InterviewDot = ({ status, delay = 0 }: { status: InterviewStatus; delay?: number }) => (
  <motion.div
    className={`h-2 w-2 rounded-full ${statusColors[status]}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, duration: 0.15 }}
  />
);

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export default function SchoolInterviewManagerPage() {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [interviews, setInterviews] = useState<InterviewWithApp[]>([]);

  const fetchInterviews = useCallback(() => schoolAdminService.interviews(), []);
  const { data, loading, error, refetch } = useApi<SchoolInterview[]>(fetchInterviews, []);

  const { data: applicantData } = useApi<SchoolApplicant[]>(
    useCallback(() => schoolAdminService.applicants({ paymentStatus: 'completed', limit: 100 }), []),
    []
  );

  // Seed local interview state from the fetched list.
  useEffect(() => {
    if (data) setInterviews(data.map(toView));
  }, [data]);

  const eligibleApplicants: EligibleApplicant[] = (applicantData ?? []).map((a) => ({
    id: a.id,
    studentName: `${a.studentProfile.firstName} ${a.studentProfile.lastName}`,
    submissionId: a.submissionId,
  }));

  const filteredInterviews = useMemo(() => {
    if (!filterStatus) return interviews;
    return interviews.filter((i) => i.status === filterStatus);
  }, [interviews, filterStatus]);

  const byDate = useMemo(() => {
    const map = new Map<string, InterviewWithApp[]>();
    filteredInterviews.forEach((i) => {
      const list = map.get(i.ticket.interviewDate) || [];
      list.push(i);
      map.set(i.ticket.interviewDate, list);
    });
    return map;
  }, [filteredInterviews]);

  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const toggleStatus = async (ticketId: string, newStatus: InterviewStatus) => {
    setInterviews((prev) => prev.map((i) => (i.ticket.id === ticketId ? { ...i, status: newStatus } : i)));
    try {
      await schoolAdminService.updateAttendance(ticketId, toBackendStatus(newStatus));
    } catch {
      refetch();
    }
  };

  const handleSchedule = async (payload: {
    applicationId: string;
    interviewDate: string;
    interviewTime: string;
    venue: string;
    room?: string;
    instructions?: string;
  }) => {
    await schoolAdminService.scheduleInterview(payload);
    refetch();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedInterviews = selectedDay ? (byDate.get(selectedDay) || []) : [];

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  return (
    <Layout zone="school">
      <div className="min-h-[calc(100dvh-72px-200px)] bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Manager</h1>
              <p className="mt-1 text-sm text-gray-500">Schedule and manage interviews</p>
            </div>
            <button
              onClick={() => setShowSchedule(true)}
              className="inline-flex items-center gap-2 self-start rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-600 active:scale-[0.98]"
            >
              <CalendarPlus className="h-4 w-4" /> Schedule New
            </button>
          </motion.div>

          {loading ? (
            <LoadingState label="Loading interviews…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
          <>
          {/* Controls bar */}
          <motion.div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="min-w-[160px] text-center text-base font-semibold text-gray-900">{formatMonthYear(currentDate)}</h2>
              <button onClick={goNext} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
            </div>

            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${view === v ? 'bg-violet-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
              <option value="">All Interviews</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="no_show">No Show</option>
            </select>
          </motion.div>

          {/* Month View */}
          <AnimatePresence mode="wait">
            {view === 'month' && (
              <motion.div key="month" className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {weekDays.map((d) => (
                    <div key={d} className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/50" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayInterviews = byDate.get(dateStr) || [];
                    const isToday = dateStr === new Date().toISOString().slice(0, 10);
                    const isSelected = selectedDay === dateStr;

                    return (
                      <motion.div
                        key={day}
                        className={`min-h-[100px] cursor-pointer border-b border-r border-gray-100 p-2 transition-colors ${isSelected ? 'border-violet-300 bg-violet-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedDay(dateStr)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.005 }}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-violet-500 text-white' : isSelected ? 'text-violet-700' : 'text-gray-700'}`}>
                            {day}
                          </span>
                          {dayInterviews.length > 0 && (
                            <span className="text-[10px] font-medium text-violet-600">{dayInterviews.length}</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {dayInterviews.slice(0, 4).map((di, idx) => (
                            <InterviewDot key={di.ticket.id} status={di.status} delay={idx * 0.02} />
                          ))}
                          {dayInterviews.length > 4 && (
                            <span className="ml-0.5 text-[9px] text-gray-400">+{dayInterviews.length - 4}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Week View */}
            {view === 'week' && (
              <motion.div key="week" className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="border-r border-gray-100 px-3 py-3 text-xs font-semibold uppercase text-gray-500" />
                  {weekDates.map((d, i) => (
                    <div key={i} className={`border-r border-gray-100 px-2 py-3 text-center text-xs font-semibold ${d.toDateString() === new Date().toDateString() ? 'bg-violet-50 text-violet-700' : 'text-gray-600'}`}>
                      {formatDayLabel(d)}
                    </div>
                  ))}
                </div>
                {timeSlots.map((slot) => (
                  <div key={slot} className="grid grid-cols-8 border-b border-gray-100">
                    <div className="flex items-center border-r border-gray-100 px-3 py-3 font-mono text-xs text-gray-400">{slot}</div>
                    {weekDates.map((d, i) => {
                      const dateStr = d.toISOString().slice(0, 10);
                      const slotInterviews = (byDate.get(dateStr) || []).filter((intr) => intr.ticket.interviewTime === slot);
                      return (
                        <div key={i} className="relative min-h-[60px] border-r border-gray-100 p-1">
                          {slotInterviews.map((intr, idx) => (
                            <motion.div
                              key={intr.ticket.id}
                              className={`rounded-md border-l-2 p-1.5 text-[10px] leading-tight ${intr.status === 'attended' ? 'border-green-500 bg-green-50 text-green-800' : intr.status === 'no_show' ? 'border-gray-400 bg-gray-100 text-gray-600' : 'border-blue-400 bg-blue-50 text-blue-800'}`}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <p className="truncate font-semibold">{intr.ticket.studentName}</p>
                              <p className="truncate opacity-75">{intr.ticket.venue.split(',')[0]}</p>
                            </motion.div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Day View */}
            {view === 'day' && (
              <motion.div key="day" className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="border-b border-gray-200 bg-violet-50 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">{currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-sm text-gray-500">{(byDate.get(currentDate.toISOString().slice(0, 10)) || []).length} interviews</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {timeSlots.map((slot) => {
                    const dateStr = currentDate.toISOString().slice(0, 10);
                    const slotInterviews = (byDate.get(dateStr) || []).filter((intr) => intr.ticket.interviewTime === slot);
                    return (
                      <div key={slot} className="flex gap-4 px-6 py-3 transition-colors hover:bg-gray-50">
                        <div className="w-20 pt-1 font-mono text-xs text-gray-400">{slot}</div>
                        <div className="flex-1 space-y-2">
                          {slotInterviews.map((intr) => (
                            <motion.div key={intr.ticket.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                                {intr.ticket.studentName.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">{intr.ticket.studentName}</p>
                                <p className="text-xs text-gray-500">{intr.ticket.venue}</p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${intr.status === 'attended' ? 'bg-green-100 text-green-700' : intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                                {statusLabels[intr.status]}
                              </span>
                            </motion.div>
                          ))}
                          {slotInterviews.length === 0 && <div className="h-2" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Day Detail Panel */}
          <AnimatePresence>
            {selectedDay && view === 'month' && (
              <motion.div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <p className="text-sm text-gray-500">{selectedInterviews.length} interview{selectedInterviews.length !== 1 ? 's' : ''} scheduled</p>
                  </div>
                  {selectedInterviews.length > 0 && (
                    <button
                      onClick={() => selectedInterviews.forEach((si) => toggleStatus(si.ticket.id, 'attended'))}
                      className="rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-600"
                    >
                      Mark All Attended
                    </button>
                  )}
                </div>

                {selectedInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInterviews.map((intr, idx) => (
                      <motion.div
                        key={intr.ticket.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        style={{ borderLeftWidth: 4, borderLeftColor: intr.status === 'attended' ? '#22c55e' : intr.status === 'no_show' ? '#9ca3af' : '#3b82f6' }}
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                          {intr.ticket.studentName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{intr.ticket.studentName}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${intr.status === 'attended' ? 'bg-green-100 text-green-700' : intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                              {statusLabels[intr.status]}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{intr.ticket.interviewTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{intr.ticket.venue}</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{formTypeLabel(intr.application.formType)}</span>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                          {intr.status !== 'attended' && (
                            <button onClick={() => toggleStatus(intr.ticket.id, 'attended')} className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50" title="Mark Attended">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {intr.status !== 'no_show' && (
                            <button onClick={() => toggleStatus(intr.ticket.id, 'no_show')} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" title="Mark No-Show">
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">No interviews scheduled for this day.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interview List Table */}
          <motion.div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="border-b border-gray-200 px-5 py-4">
              <h3 className="font-semibold text-gray-900">All Scheduled Interviews</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-violet-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Form Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Venue</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((intr, idx) => (
                    <motion.tr key={intr.ticket.id} className="border-b border-gray-100 transition-colors hover:bg-violet-50/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                      <td className="px-4 py-3 text-gray-600">{formatDate(intr.ticket.interviewDate)}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{intr.ticket.interviewTime}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{intr.ticket.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{formTypeLabel(intr.application.formType)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{intr.ticket.venue}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${intr.status === 'attended' ? 'bg-green-100 text-green-700' : intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                          {statusLabels[intr.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {intr.status !== 'attended' && (
                            <button onClick={() => toggleStatus(intr.ticket.id, 'attended')} className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50" title="Mark Attended"><CheckCircle className="h-4 w-4" /></button>
                          )}
                          {intr.status !== 'no_show' && (
                            <button onClick={() => toggleStatus(intr.ticket.id, 'no_show')} className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100" title="Mark No-Show"><XCircle className="h-4 w-4" /></button>
                          )}
                          <button className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100" title="Reminder"><Bell className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredInterviews.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No interviews found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          </>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        applicants={eligibleApplicants}
        existingInterviews={interviews}
        onSchedule={handleSchedule}
      />
    </Layout>
  );
}
