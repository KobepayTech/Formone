import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarPlus, Clock, MapPin,
  CheckCircle, XCircle, Bell, Search, X, AlertTriangle,
  FileText,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { applications } from '@/lib/mockData';
import type { InterviewTicket, Application } from '@/types';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type ViewMode = 'month' | 'week' | 'day';
type InterviewStatus = 'confirmed' | 'attended' | 'no_show';

interface InterviewWithApp {
  ticket: InterviewTicket;
  application: Application | undefined;
  status: InterviewStatus;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const SCHOOL_ID = 'sch_001';
const SCHOOL_NAME = 'Delhi Public School';

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

const formTypeLabel = (ft: string) => ft.charAt(0).toUpperCase() + ft.slice(1);

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDayLabel = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
const formatMonthYear = (d: Date) => d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
];

const venues = ['Main Campus - Admin Block', 'Primary Wing', 'Administrative Block', 'Science Block'];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

/* ── Schedule Interview Modal ──────────────────────────────────────────────── */

const ScheduleModal: React.FC<{
  open: boolean;
  onClose: () => void;
  existingInterviews: InterviewWithApp[];
  onSchedule: (interview: InterviewWithApp) => void;
}> = ({ open, onClose, existingInterviews, onSchedule }) => {
  const [studentQuery, setStudentQuery] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [sendReminder, setSendReminder] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [success, setSuccess] = useState(false);

  // Get applicants without interviews (paid but no interview scheduled)
  const eligibleApps = useMemo(() =>
    applications.filter(a =>
      a.schoolId === SCHOOL_ID &&
      a.paymentStatus === 'completed' &&
      !existingInterviews.some(ei => ei.application?.studentId === a.studentId)
    ), [existingInterviews]);

  const filteredApps = useMemo(() => {
    if (!studentQuery) return eligibleApps;
    const q = studentQuery.toLowerCase();
    return eligibleApps.filter(a => a.studentName.toLowerCase().includes(q));
  }, [eligibleApps, studentQuery]);

  // Conflict detection
  const conflicts = useMemo(() => {
    if (!date || !time || !venue) return [];
    return existingInterviews.filter(ei =>
      ei.ticket.interviewDate === date &&
      ei.ticket.interviewTime === time &&
      ei.ticket.venue.includes(venue)
    );
  }, [date, time, venue, existingInterviews]);

  const hasConflict = conflicts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !date || !time || !venue) return;

    const newTicket: InterviewTicket = {
      id: `tkt_new_${Date.now()}`,
      ticketNumber: `INT-DPS-${Date.now().toString().slice(-6)}`,
      submissionId: selectedApp.submissionId,
      studentId: selectedApp.studentId,
      schoolId: SCHOOL_ID,
      studentName: selectedApp.studentName,
      schoolName: SCHOOL_NAME,
      interviewDate: date,
      interviewTime: time,
      venue: `${venue}${room ? `, Room ${room}` : ''}`,
      instructions: notes || 'Please arrive 15 minutes early with all original documents.',
      ticketQrCode: `INT-DPS-QR-${Date.now()}`,
      status: 'generated',
      createdAt: new Date().toISOString(),
    };

    onSchedule({ ticket: newTicket, application: selectedApp, status: 'confirmed' });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setStudentQuery('');
      setDate('');
      setTime('');
      setVenue('');
      setRoom('');
      setNotes('');
      setSelectedApp(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }}>
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>

            {success ? (
              <motion.div className="flex flex-col items-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Scheduled!</h3>
                <p className="text-sm text-gray-500 text-center">{sendReminder && 'SMS reminder queued for 24 hours before.'}</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Schedule Interview</h2>
                <p className="text-sm text-gray-500 mb-5">Create a new interview slot for an applicant.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Student Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Applicant</label>
                    {!selectedApp ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={studentQuery}
                          onChange={e => setStudentQuery(e.target.value)}
                          placeholder="Search applicant..."
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                          autoFocus
                        />
                        {filteredApps.length > 0 && studentQuery && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                            {filteredApps.map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => { setSelectedApp(app); setStudentQuery(app.studentName); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 transition-colors flex items-center justify-between"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
                      <select value={time} onChange={e => setTime(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
                        <option value="">Select Time</option>
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
                      <select value={venue} onChange={e => setVenue(e.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
                        <option value="">Select Venue</option>
                        {venues.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                      <input type="text" value={room} onChange={e => setRoom(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="e.g. 203" />
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  <AnimatePresence>
                    {hasConflict && (
                      <motion.div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2 items-start" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Schedule Conflict</p>
                          <p className="text-amber-700">{conflicts[0].ticket.venue} is already booked at {time} by <strong>{conflicts[0].ticket.studentName}</strong>.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all resize-none" placeholder="Any special instructions..." />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sendReminder} onChange={e => setSendReminder(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-500 focus:ring-violet-500" />
                    <span className="text-sm text-gray-600">Send SMS reminder 24 hours before</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={!selectedApp || !date || !time || !venue} className="flex-1 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_4px_14px_rgba(139,92,246,0.3)]">
                      Schedule Interview
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
    className={`w-2 h-2 rounded-full ${statusColors[status]}`}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, duration: 0.15 }}
  />
);

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export default function SchoolInterviewManagerPage() {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // March 2025
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [interviews, setInterviews] = useState<InterviewWithApp[]>(() => {
    // Build interviews from applications with tickets for this school
    return applications
      .filter(a => a.schoolId === SCHOOL_ID)
      .flatMap(a =>
        a.tickets.map(t => ({
          ticket: t,
          application: a,
          status: a.status === 'accepted' ? 'attended' as InterviewStatus :
                  a.status === 'rejected' ? 'no_show' as InterviewStatus :
                  'confirmed' as InterviewStatus,
        }))
      );
  });
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Filter by status
  const filteredInterviews = useMemo(() => {
    if (!filterStatus) return interviews;
    return interviews.filter(i => i.status === filterStatus);
  }, [interviews, filterStatus]);

  // Group by date
  const byDate = useMemo(() => {
    const map = new Map<string, InterviewWithApp[]>();
    filteredInterviews.forEach(i => {
      const list = map.get(i.ticket.interviewDate) || [];
      list.push(i);
      map.set(i.ticket.interviewDate, list);
    });
    return map;
  }, [filteredInterviews]);

  // Calendar navigation
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

  // Attendance toggle
  const toggleStatus = (ticketId: string, newStatus: InterviewStatus) => {
    setInterviews(prev => prev.map(i => i.ticket.id === ticketId ? { ...i, status: newStatus } : i));
  };

  // Handle new interview
  const handleSchedule = (newInterview: InterviewWithApp) => {
    setInterviews(prev => [...prev, newInterview]);
  };

  // Month view data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get selected day interviews
  const selectedInterviews = selectedDay ? (byDate.get(selectedDay) || []) : [];

  // Week view: get dates for current week
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Manager</h1>
              <p className="text-sm text-gray-500 mt-1">{SCHOOL_NAME} — Schedule and manage interviews</p>
            </div>
            <button
              onClick={() => setShowSchedule(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(139,92,246,0.3)] self-start"
            >
              <CalendarPlus className="h-4 w-4" /> Schedule New
            </button>
          </motion.div>

          {/* Controls bar */}
          <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-base font-semibold text-gray-900 min-w-[160px] text-center">{formatMonthYear(currentDate)}</h2>
              <button onClick={goNext} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"><ChevronRight className="h-5 w-5" /></button>
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['month', 'week', 'day'] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    view === v ? 'bg-violet-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
              <option value="">All Interviews</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="no_show">No Show</option>
            </select>
          </motion.div>

          {/* Month View */}
          <AnimatePresence mode="wait">
            {view === 'month' && (
              <motion.div key="month" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Week day headers */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {weekDays.map(d => (
                    <div key={d} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                {/* Days grid */}
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
                        className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors ${
                          isSelected ? 'bg-violet-50 border-violet-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDay(dateStr)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.005 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-violet-500 text-white' : isSelected ? 'text-violet-700' : 'text-gray-700'
                          }`}>
                            {day}
                          </span>
                          {dayInterviews.length > 0 && (
                            <span className="text-[10px] font-medium text-violet-600">{dayInterviews.length}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayInterviews.slice(0, 4).map((di, idx) => (
                            <InterviewDot key={di.ticket.id} status={di.status} delay={idx * 0.02} />
                          ))}
                          {dayInterviews.length > 4 && (
                            <span className="text-[9px] text-gray-400 ml-0.5">+{dayInterviews.length - 4}</span>
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
              <motion.div key="week" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase border-r border-gray-100" />
                  {weekDates.map((d, i) => (
                    <div key={i} className={`px-2 py-3 text-center text-xs font-semibold border-r border-gray-100 ${
                      d.toDateString() === new Date().toDateString() ? 'bg-violet-50 text-violet-700' : 'text-gray-600'
                    }`}>
                      {formatDayLabel(d)}
                    </div>
                  ))}
                </div>
                {timeSlots.map(slot => (
                  <div key={slot} className="grid grid-cols-8 border-b border-gray-100">
                    <div className="px-3 py-3 text-xs font-mono text-gray-400 border-r border-gray-100 flex items-center">{slot}</div>
                    {weekDates.map((d, i) => {
                      const dateStr = d.toISOString().slice(0, 10);
                      const slotInterviews = (byDate.get(dateStr) || []).filter(
                        intr => intr.ticket.interviewTime === slot
                      );
                      return (
                        <div key={i} className="min-h-[60px] border-r border-gray-100 p-1 relative">
                          {slotInterviews.map((intr, idx) => (
                            <motion.div
                              key={intr.ticket.id}
                              className={`rounded-md p-1.5 text-[10px] leading-tight border-l-2 ${
                                intr.status === 'attended' ? 'bg-green-50 border-green-500 text-green-800' :
                                intr.status === 'no_show' ? 'bg-gray-100 border-gray-400 text-gray-600' :
                                'bg-blue-50 border-blue-400 text-blue-800'
                              }`}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <p className="font-semibold truncate">{intr.ticket.studentName}</p>
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
              <motion.div key="day" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="px-6 py-4 border-b border-gray-200 bg-violet-50">
                  <h3 className="font-semibold text-gray-900">{currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-sm text-gray-500">{((byDate.get(currentDate.toISOString().slice(0, 10)) || []).length)} interviews</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {timeSlots.map(slot => {
                    const dateStr = currentDate.toISOString().slice(0, 10);
                    const slotInterviews = (byDate.get(dateStr) || []).filter(
                      intr => intr.ticket.interviewTime === slot
                    );
                    return (
                      <div key={slot} className="flex gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                        <div className="w-20 text-xs font-mono text-gray-400 pt-1">{slot}</div>
                        <div className="flex-1 space-y-2">
                          {slotInterviews.map(intr => (
                            <motion.div
                              key={intr.ticket.id}
                              className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 bg-white"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                                {intr.ticket.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{intr.ticket.studentName}</p>
                                <p className="text-xs text-gray-500">{intr.ticket.venue}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                intr.status === 'attended' ? 'bg-green-100 text-green-700' :
                                intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' :
                                'bg-blue-100 text-blue-700'
                              }`}>
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
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <p className="text-sm text-gray-500">{selectedInterviews.length} interview{selectedInterviews.length !== 1 ? 's' : ''} scheduled</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedInterviews.length > 0 && (
                      <>
                        <button
                          onClick={() => selectedInterviews.forEach(si => toggleStatus(si.ticket.id, 'attended'))}
                          className="rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                        >
                          Mark All Attended
                        </button>
                        <button
                          onClick={() => { /* Send reminders logic */ }}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                        >
                          <Bell className="h-3.5 w-3.5" /> Remind All
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {selectedInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInterviews.map((intr, idx) => (
                      <motion.div
                        key={intr.ticket.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        style={{ borderLeftWidth: 4, borderLeftColor: intr.status === 'attended' ? '#22c55e' : intr.status === 'no_show' ? '#9ca3af' : '#3b82f6' }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                            {intr.ticket.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{intr.ticket.studentName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              intr.status === 'attended' ? 'bg-green-100 text-green-700' :
                              intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {statusLabels[intr.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{intr.ticket.interviewTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{intr.ticket.venue}</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{intr.application ? formTypeLabel(intr.application.formType) : '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {intr.status !== 'attended' && (
                            <button
                              onClick={() => toggleStatus(intr.ticket.id, 'attended')}
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 transition-colors"
                              title="Mark Attended"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {intr.status !== 'no_show' && (
                            <button
                              onClick={() => toggleStatus(intr.ticket.id, 'no_show')}
                              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                              title="Mark No-Show"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Send Reminder">
                            <Bell className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No interviews scheduled for this day.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interview List Table */}
          <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">All Scheduled Interviews</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-violet-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Student</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Form Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Venue</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredInterviews.map((intr, idx) => (
                      <motion.tr
                        key={intr.ticket.id}
                        className="border-b border-gray-100 hover:bg-violet-50/30 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <td className="px-4 py-3 text-gray-600">{formatDate(intr.ticket.interviewDate)}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{intr.ticket.interviewTime}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{intr.ticket.studentName}</td>
                        <td className="px-4 py-3"><StatusBadge status={intr.application?.formType || 'admission'} type="application" /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{intr.ticket.venue}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            intr.status === 'attended' ? 'bg-green-100 text-green-700' :
                            intr.status === 'no_show' ? 'bg-gray-100 text-gray-600' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {statusLabels[intr.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {intr.status !== 'attended' && (
                              <button onClick={() => toggleStatus(intr.ticket.id, 'attended')} className="rounded p-1.5 text-green-600 hover:bg-green-50 transition-colors" title="Mark Attended"><CheckCircle className="h-4 w-4" /></button>
                            )}
                            {intr.status !== 'no_show' && (
                              <button onClick={() => toggleStatus(intr.ticket.id, 'no_show')} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 transition-colors" title="Mark No-Show"><XCircle className="h-4 w-4" /></button>
                            )}
                            <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 transition-colors" title="Remind"><Bell className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredInterviews.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No interviews found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} existingInterviews={interviews} onSchedule={handleSchedule} />
    </Layout>
  );
}
