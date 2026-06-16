import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Hash,
  Download,
  Printer,
  Navigation,
  CheckCircle,
  Ticket,
  Building2,
  X,
} from 'lucide-react';
import { Link } from 'react-router';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { interviewTickets, studentProfiles } from '@/lib/mockData';

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ── Ticket Status Helpers ─────────────────────────────────────────────────── */

type FilterTab = 'all' | 'valid' | 'used' | 'expired';

const getTicketStatusCategory = (status: string): 'valid' | 'used' | 'expired' => {
  switch (status) {
    case 'used': return 'used';
    case 'expired': return 'expired';
    default: return 'valid';
  }
};

const statusBorderColor: Record<string, string> = {
  valid: 'border-l-success-500',
  used: 'border-l-gray-400',
  expired: 'border-l-error-500',
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function ParentTicketWalletPage() {
  const [student] = useState(studentProfiles[0]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedTicket, setSelectedTicket] = useState<typeof interviewTickets[0] | null>(null);

  const tickets = useMemo(
    () => interviewTickets.filter((t) => t.studentId === student.id),
    [student.id]
  );

  const filtered = useMemo(() => {
    if (activeTab === 'all') return tickets;
    return tickets.filter((t) => getTicketStatusCategory(t.status) === activeTab);
  }, [tickets, activeTab]);

  const counts = {
    all: tickets.length,
    valid: tickets.filter((t) => getTicketStatusCategory(t.status) === 'valid').length,
    used: tickets.filter((t) => getTicketStatusCategory(t.status) === 'used').length,
    expired: tickets.filter((t) => getTicketStatusCategory(t.status) === 'expired').length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'valid', label: `Upcoming (${counts.valid})` },
    { key: 'used', label: `Past (${counts.used})` },
    { key: 'expired', label: `Expired (${counts.expired})` },
  ];

  if (tickets.length === 0) {
    return (
      <Layout zone="parent">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
          <Ticket className="mx-auto h-20 w-20 text-gray-200" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No Tickets Yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Apply to schools and complete payment to receive your interview tickets here.
          </p>
          <Link
            to="/parent/schools"
            className="mt-5 rounded-xl bg-parent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px"
          >
            Browse Schools
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <motion.div className="mb-5 flex items-center justify-between" {...fadeUp(0)}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Interview Tickets</h1>
            <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-parent-100 px-2 text-xs font-bold text-parent-600">
              {tickets.length}
            </span>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1" {...fadeUp(0.1)}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.key ? 'bg-white text-parent-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Ticket List */}
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          key={activeTab}
        >
          <AnimatePresence mode="wait">
            {filtered.map((ticket) => {
              const category = getTicketStatusCategory(ticket.status);
              const isExpired = category === 'expired';
              const isUsed = category === 'used';

              return (
                <motion.div
                  key={ticket.id}
                  variants={staggerItem}
                  layout
                  className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${statusBorderColor[category]} border-l-[4px]`}
                >
                  {/* Perforated edge effect */}
                  <div className="absolute left-[70%] top-0 hidden h-full border-r border-dashed border-gray-300 sm:block" />

                  <div className="flex flex-col sm:flex-row">
                    {/* Left — Info (70%) */}
                    <div className={`flex-1 p-4 sm:p-5 ${isExpired ? 'opacity-50' : isUsed ? 'opacity-80' : ''}`}>
                      {/* School header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-parent-500" />
                          <h3 className="text-base font-semibold text-gray-900">{ticket.schoolName}</h3>
                        </div>
                        <StatusBadge status={ticket.status} type="ticket" />
                      </div>

                      {/* Interview details */}
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 shrink-0 text-parent-400" />
                          {new Date(ticket.interviewDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 shrink-0 text-parent-400" />
                          {ticket.interviewTime}
                        </div>
                        <div className="col-span-2 flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-parent-400" />
                          {ticket.venue}
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 shrink-0 text-parent-400" />
                          <span className="font-mono text-xs text-parent-600">{ticket.ticketNumber}</span>
                        </div>
                      </div>

                      {/* Form info */}
                      <p className="mt-3 text-xs text-gray-500">
                        Form: Class 1 Admission · Board: {ticket.schoolName.includes('ICSE') ? 'ICSE' : ticket.schoolName.includes('IB') ? 'IB' : 'CBSE'}
                      </p>

                      {/* Instructions */}
                      <p className="mt-1.5 text-xs text-gray-400 italic">{ticket.instructions}</p>

                      {/* Actions (mobile only) */}
                      <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                        <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                        <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                          <Printer className="h-3.5 w-3.5" /> Print
                        </button>
                      </div>
                    </div>

                    {/* Right — QR & Actions (30%) */}
                    <div
                      className={`flex flex-col items-center justify-center gap-3 border-t border-gray-100 p-4 sm:border-t-0 sm:border-l sm:border-dashed sm:border-gray-300 ${
                        isExpired ? 'opacity-50' : isUsed ? 'opacity-80' : ''
                      }`}
                    >
                      {/* QR */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className={`rounded-xl bg-white p-2 shadow-sm ${isExpired ? 'grayscale' : ''}`}>
                          <QRCodeSVG value={ticket.ticketQrCode} size={90} level="M" />
                        </div>
                        {isUsed && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                            <CheckCircle className="h-8 w-8 text-success-500" />
                          </div>
                        )}
                        {isExpired && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="-rotate-12 rounded bg-error-500/80 px-2 py-0.5 text-xs font-bold text-white">
                              EXPIRED
                            </span>
                          </div>
                        )}
                        <p className="mt-1 text-center text-[10px] text-gray-400">Scan at entry</p>
                      </div>

                      {/* Desktop actions */}
                      <div className="hidden w-full space-y-1.5 sm:block">
                        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-600 transition-all hover:bg-gray-50">
                          <Download className="h-3 w-3" /> Download PDF
                        </button>
                        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-600 transition-all hover:bg-gray-50">
                          <Calendar className="h-3 w-3" /> Add to Calendar
                        </button>
                        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[11px] font-medium text-gray-600 transition-all hover:bg-gray-50">
                          <Navigation className="h-3 w-3" /> Get Directions
                        </button>
                        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-gray-500 transition-all hover:bg-gray-50">
                          <Printer className="h-3 w-3" /> Print
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div className="mt-12 text-center" {...fadeUp(0)}>
            <p className="text-sm text-gray-500">No tickets in this category.</p>
          </motion.div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              className="h-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-parent-500 to-parent-600 p-5 text-white">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <Ticket className="mb-2 h-6 w-6" />
                <h3 className="text-lg font-bold">{selectedTicket.schoolName}</h3>
                <p className="mt-0.5 text-sm text-white/80">Official Interview Ticket</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Large QR */}
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-white p-4 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <QRCodeSVG value={selectedTicket.ticketQrCode} size={200} level="H" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-parent-500" />
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedTicket.interviewDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-parent-500" />
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{selectedTicket.interviewTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-parent-500" />
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium text-gray-900">{selectedTicket.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-parent-500" />
                    <span className="text-gray-600">Ticket No:</span>
                    <span className="font-mono font-medium text-parent-600">{selectedTicket.ticketNumber}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">{selectedTicket.instructions}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-parent-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-parent-700">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
