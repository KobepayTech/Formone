import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Eye,
  X,
  QrCode,
  Calendar,
  MapPin,
  Building2,
  CheckSquare,
  Square,
  Clock,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { vendorService, type VendorTicket } from '@/lib/api';

/* ── Types ── */
type FilterTab = 'all' | 'ready' | 'printed';

interface TicketView {
  id: string;
  ticketNumber: string;
  studentName: string;
  schoolName: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  qrCode: string;
  status: string;
  printed: boolean;
  printedAt?: string | null;
}

const toTicketView = (t: VendorTicket): TicketView => ({
  id: t.id,
  ticketNumber: t.ticketNumber,
  studentName: `${t.studentProfile.firstName} ${t.studentProfile.lastName}`,
  schoolName: t.school.name,
  interviewDate: new Date(t.interviewDate).toLocaleDateString('en-GB'),
  interviewTime: t.interviewTime,
  venue: t.venue,
  qrCode: t.ticketQrCode || t.ticketNumber,
  status: t.status,
  printed: t.printedByVendor,
  printedAt: t.printedAt,
});

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

/* ── Print Quota Indicator ── */
const PrintQuotaBar: FC<{ printed: number; total: number }> = ({ printed, total }) => {
  const percent = total > 0 ? (printed / total) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Printer className="h-5 w-5 text-vendor-500" />
          <span className="text-sm font-medium text-gray-700">
            Printed: <strong className="text-gray-900">{printed}</strong> / {total} tickets
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Printer className="h-3.5 w-3.5 text-emerald-500" />
          Printer online
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-vendor-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        />
      </div>
    </motion.div>
  );
};

/* ── Ticket Card ── */
const TicketCard: FC<{
  ticket: TicketView;
  index: number;
  batchMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onPrint: () => void;
}> = ({ ticket, index, batchMode, selected, onSelect, onPreview, onPrint }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="group relative overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
  >
    {batchMode && (
      <button
        onClick={onSelect}
        className="absolute left-3 top-3 z-10 rounded bg-white/90 p-1 shadow-sm transition-colors hover:bg-white"
      >
        {selected ? <CheckSquare className="h-5 w-5 text-vendor-500" /> : <Square className="h-5 w-5 text-gray-400" />}
      </button>
    )}

    <div onClick={onPreview} className="relative aspect-[2/1] cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="rotate-[-15deg] text-3xl font-bold uppercase tracking-widest text-gray-300/40">
          {ticket.printed ? 'Printed' : 'Preview'}
        </span>
      </div>

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-vendor-600" />
            <span className="max-w-[180px] truncate text-xs font-semibold text-vendor-700">{ticket.schoolName}</span>
          </div>
          <StatusBadge status={ticket.status} type="ticket" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">{ticket.studentName}</p>
            <p className="font-mono text-[10px] text-gray-500">{ticket.ticketNumber}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {ticket.interviewDate}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {ticket.interviewTime}
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded bg-white shadow-sm">
            <QrCode className="h-8 w-8 text-gray-700" />
          </div>
        </div>
      </div>
    </div>

    <div className="p-4">
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          {ticket.venue}
        </div>
        {ticket.printed && ticket.printedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Printer className="h-3 w-3" />
            Printed {new Date(ticket.printedAt).toLocaleDateString('en-GB')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-vendor-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-vendor-600"
        >
          <Printer className="h-3.5 w-3.5" />
          {ticket.printed ? 'Reprint' : 'Print'}
        </button>
        <button
          onClick={onPreview}
          className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </motion.div>
);

/* ── Print Settings Modal ── */
const PrintSettingsModal: FC<{
  open: boolean;
  count: number;
  onClose: () => void;
  onPrint: () => Promise<void> | void;
}> = ({ open, count, onClose, onPrint }) => {
  const [copies, setCopies] = useState(1);
  const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    await onPrint();
    setIsPrinting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Print Settings</h3>
              <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {count > 1 && (
              <p className="mb-4 rounded-lg bg-vendor-50 px-3 py-2 text-sm text-vendor-700">
                Printing {count} tickets
              </p>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Copies</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-lg font-semibold">{copies}</span>
                <button
                  onClick={() => setCopies((c) => Math.min(5, c + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Print Quality</label>
              <div className="flex gap-2">
                {(['draft', 'standard', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors
                      ${quality === q ? 'border-vendor-500 bg-vendor-50 text-vendor-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
                    `}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-vendor-500 text-base font-semibold text-white transition-colors hover:bg-vendor-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPrinting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending to printer...
                </>
              ) : (
                <>
                  <Printer className="h-5 w-5" />
                  Print Now
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Ticket Preview Modal ── */
const TicketPreviewModal: FC<{
  open: boolean;
  ticket: TicketView | null;
  onClose: () => void;
  onPrint: () => void;
}> = ({ open, ticket, onClose, onPrint }) => {
  if (!ticket) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-0 shadow-elevated"
          >
            <div className="bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="mb-4 flex items-center justify-between border-b-2 border-vendor-500 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vendor-500">
                    <Printer className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900">EduResult Pro</h3>
                    <p className="text-[10px] text-gray-500">Official Interview Ticket</p>
                  </div>
                </div>
                <p className="font-mono text-lg font-bold text-vendor-700">{ticket.ticketNumber}</p>
              </div>

              <div className="mb-4 rounded-lg bg-vendor-500 px-4 py-3 text-center text-white">
                <h4 className="text-lg font-bold">{ticket.schoolName}</h4>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.studentName}</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Interview Date</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.interviewDate}</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Interview Time</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.interviewTime}</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Venue</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.venue}</p>
                </div>
              </div>

              <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100">
                  <QrCode className="h-24 w-24 text-gray-800" />
                </div>
                <p className="mt-2 font-mono text-xs text-gray-500">{ticket.qrCode}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 rounded-lg bg-vendor-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-vendor-600"
              >
                <Printer className="h-4 w-4" />
                Print Ticket
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Main Page Component ── */
const VendorTicketPrintingPage: FC = () => {
  const fetchTickets = useCallback(() => vendorService.tickets(), []);
  const { data, loading, error, refetch } = useApi<VendorTicket[]>(fetchTickets, []);

  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<TicketView | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [printTargets, setPrintTargets] = useState<string[]>([]);

  useEffect(() => {
    if (data) setTickets(data.map(toTicketView));
  }, [data]);

  const filteredTickets = tickets.filter((t) => {
    switch (activeTab) {
      case 'ready': return !t.printed;
      case 'printed': return t.printed;
      default: return true;
    }
  });

  const readyCount = tickets.filter((t) => !t.printed).length;
  const printedCount = tickets.filter((t) => t.printed).length;

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const ids = filteredTickets.map((t) => t.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const openPrint = (ids: string[]) => {
    if (ids.length === 0) return;
    setPrintTargets(ids);
    setPrintModalOpen(true);
  };

  const runPrint = async () => {
    const ids = printTargets;
    await Promise.all(ids.map((id) => vendorService.printTicket(id).catch(() => null)));
    setTickets((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, printed: true, printedAt: new Date().toISOString() } : t))
    );
    setSelectedIds(new Set());
    setPreviewTicket(null);
    setPreviewOpen(false);
    // Trigger the browser print dialog for the physical copy.
    window.print();
  };

  const openPreview = (ticket: TicketView) => {
    setPreviewTicket(ticket);
    setPreviewOpen(true);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tickets.length },
    { key: 'ready', label: 'Ready to Print', count: readyCount },
    { key: 'printed', label: 'Printed', count: printedCount },
  ];

  if (loading) {
    return (
      <Layout zone="vendor">
        <LoadingState label="Loading tickets…" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout zone="vendor">
        <ErrorState message={error} onRetry={refetch} />
      </Layout>
    );
  }

  return (
    <Layout zone="vendor">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Ticket Printing</h1>
              <p className="mt-1 text-sm text-gray-500">Print interview tickets for paid applicants</p>
            </div>
            <button
              onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()); }}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                ${batchMode ? 'border-vendor-300 bg-vendor-50 text-vendor-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}
              `}
            >
              {batchMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              Batch Mode
            </button>
          </div>

          {/* Print Quota */}
          <div className="mb-6">
            <PrintQuotaBar printed={printedCount} total={tickets.length} />
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  ${activeTab === tab.key ? 'bg-vendor-500 text-white' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Batch controls */}
          <AnimatePresence>
            {batchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-3"
              >
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {filteredTickets.length > 0 && filteredTickets.every((t) => selectedIds.has(t.id)) ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Select All
                </button>
                {selectedIds.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => openPrint([...selectedIds])}
                    className="flex items-center gap-1.5 rounded-lg bg-vendor-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-vendor-600"
                  >
                    <Printer className="h-4 w-4" />
                    Print Selected ({selectedIds.size})
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tickets Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket, i) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                index={i}
                batchMode={batchMode}
                selected={selectedIds.has(ticket.id)}
                onSelect={() => handleSelect(ticket.id)}
                onPreview={() => openPreview(ticket)}
                onPrint={() => openPrint([ticket.id])}
              />
            ))}
            {filteredTickets.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">No tickets found for this filter</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrintSettingsModal
        open={printModalOpen}
        count={printTargets.length}
        onClose={() => setPrintModalOpen(false)}
        onPrint={runPrint}
      />
      <TicketPreviewModal
        open={previewOpen}
        ticket={previewTicket}
        onClose={() => { setPreviewOpen(false); setPreviewTicket(null); }}
        onPrint={() => { if (previewTicket) openPrint([previewTicket.id]); }}
      />
    </Layout>
  );
};

export default VendorTicketPrintingPage;
