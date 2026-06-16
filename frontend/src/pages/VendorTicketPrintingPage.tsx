import { useState, useCallback, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Eye,
  X,
  Shield,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  QrCode,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  CheckSquare,
  Square,
  Clock,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { interviewTickets, vendors } from '@/lib/mockData';

/* ── Types ── */
type FilterTab = 'all' | 'ready' | 'printed' | 'failed';

interface TicketView {
  id: string;
  ticketNumber: string;
  studentName: string;
  schoolName: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  qrCode: string;
  status: 'generated' | 'printed' | 'downloaded' | 'used' | 'expired';
  printedBy?: string;
  printedAt?: string;
  selected?: boolean;
  failureReason?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  ticketNumber: string;
  parentName: string;
  studentName: string;
  schoolName: string;
  printedBy: string;
  status: 'Printed' | 'Reprint' | 'Failed';
  ipAddress: string;
  blockchainHash: string;
}

/* ── Transform interview tickets to view models ── */
const allTickets: TicketView[] = interviewTickets.map((t) => ({
  id: t.id,
  ticketNumber: t.ticketNumber,
  studentName: t.studentName,
  schoolName: t.schoolName,
  interviewDate: t.interviewDate,
  interviewTime: t.interviewTime,
  venue: t.venue,
  qrCode: t.ticketQrCode,
  status: t.status,
  printedBy: t.printedByVendor ? vendors.find((v) => v.id === t.printedByVendor)?.name : undefined,
  printedAt: t.printedAt,
}));

/* ── Create failed ticket for demo ── */
const failedTicket: TicketView = {
  id: 'tkt_failed_001',
  ticketNumber: 'INT-POD-250099',
  studentName: 'Aarav Reddy',
  schoolName: 'Podar International',
  interviewDate: '2025-04-25',
  interviewTime: '09:00 AM',
  venue: 'Podar International Pune',
  qrCode: 'INT-POD-250099-QR',
  status: 'generated',
  failureReason: 'Printer timeout — retry',
};

allTickets.push(failedTicket);

/* ── Audit log entries ── */
const auditEntries: AuditEntry[] = [
  { id: 'aud_001', timestamp: '14:35:10', ticketNumber: 'INT-DPS-250001', parentName: 'Rajesh Sharma', studentName: 'Aarav Sharma', schoolName: 'Delhi Public School', printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6' },
  { id: 'aud_002', timestamp: '14:30:22', ticketNumber: 'INT-SXA-250002', parentName: 'Suresh Gupta', studentName: 'Ananya Gupta', schoolName: "St. Xavier's Academy", printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c' },
  { id: 'aud_003', timestamp: '14:28:05', ticketNumber: 'INT-GWI-250003', parentName: 'Lakshmi Reddy', studentName: 'Vihaan Reddy', schoolName: 'Greenwood International', printedBy: 'Sharma Store', status: 'Reprint', ipAddress: '192.168.1.105', blockchainHash: '0xa1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12' },
  { id: 'aud_004', timestamp: '14:15:33', ticketNumber: 'INT-CMS-250004', parentName: 'Meena Patel', studentName: 'Diya Patel', schoolName: 'City Montessori School', printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0xb2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef1234' },
  { id: 'aud_005', timestamp: '14:10:45', ticketNumber: 'INT-THS-250005', parentName: 'Amit Kumar', studentName: 'Aditya Kumar', schoolName: 'The Heritage School', printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0xc3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef123456' },
  { id: 'aud_006', timestamp: '14:05:12', ticketNumber: 'INT-POD-250006', parentName: 'Fatima Khan', studentName: 'Sara Khan', schoolName: 'Podar International', printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0xd4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12345678' },
  { id: 'aud_007', timestamp: '13:58:20', ticketNumber: 'INT-DPS-250007', parentName: 'Neha Malhotra', studentName: 'Kabir Malhotra', schoolName: 'Delhi Public School', printedBy: 'Sharma Store', status: 'Printed', ipAddress: '192.168.1.105', blockchainHash: '0xe5f678901234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
  { id: 'aud_008', timestamp: '13:45:10', ticketNumber: 'INT-SXA-250008', parentName: 'Arun Nair', studentName: 'Isha Nair', schoolName: "St. Xavier's Academy", printedBy: 'Sharma Store', status: 'Failed', ipAddress: '192.168.1.105', blockchainHash: '0xf678901234567890abcdef1234567890abcdef1234567890abcdef123456789012' },
];

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
const PrintQuotaBar: FC<{ printed: number; max: number }> = ({ printed, max }) => {
  const percent = (printed / max) * 100;
  const getColor = () => {
    if (percent >= 95) return 'bg-red-500';
    if (percent >= 80) return 'bg-amber-400';
    return 'bg-vendor-500';
  };
  const getStatusBadge = () => {
    if (percent >= 95) return { label: 'Critical', color: 'bg-red-100 text-red-600' };
    if (percent >= 80) return { label: 'Warning', color: 'bg-amber-100 text-amber-600' };
    return { label: 'Normal', color: 'bg-emerald-100 text-emerald-600' };
  };
  const status = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Printer className="h-5 w-5 text-vendor-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Daily Print Quota: <strong className="text-gray-900">{printed}</strong> / {max} tickets
            </span>
            <span className="ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Printer className="h-3.5 w-3.5 text-emerald-500" />
          Online
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-vendor-600 font-medium">{Math.round(percent)}% used</span>
        <span className="font-mono text-xs text-gray-400">{max - printed} remaining</span>
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
}> = ({ ticket, index, batchMode, selected, onSelect, onPreview, onPrint }) => {
  const isFailed = !!ticket.failureReason;
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={`group relative overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]
        ${isFailed ? 'border border-red-200' : ''}
      `}
    >
      {/* Checkbox overlay */}
      {batchMode && (
        <button
          onClick={onSelect}
          className="absolute left-3 top-3 z-10 rounded bg-white/90 p-1 shadow-sm transition-colors hover:bg-white"
        >
          {selected ? (
            <CheckSquare className="h-5 w-5 text-vendor-500" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )}

      {/* Ticket Preview Area */}
      <div
        onClick={onPreview}
        className="relative aspect-[2/1] cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 p-4"
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="rotate-[-15deg] text-3xl font-bold text-gray-300/40 uppercase tracking-widest">
            {ticket.status === 'printed' ? 'Printed' : 'Preview'}
          </span>
        </div>

        <div className="relative h-full flex flex-col justify-between">
          {/* School header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-vendor-600" />
              <span className="text-xs font-semibold text-vendor-700 truncate max-w-[180px]">
                {ticket.schoolName}
              </span>
            </div>
            <StatusBadge status={ticket.status} type="ticket" />
          </div>

          {/* Student info */}
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
            {/* QR placeholder */}
            <div className="flex h-12 w-12 items-center justify-center rounded bg-white shadow-sm">
              <QrCode className="h-8 w-8 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4">
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {ticket.venue}
          </div>
          {ticket.printedBy && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Printer className="h-3 w-3" />
              Printed by {ticket.printedBy}
              {ticket.printedAt && (
                <span className="font-mono">
                  {new Date(ticket.printedAt).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
          )}
          {isFailed && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {ticket.failureReason}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            disabled={isFailed}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-vendor-500 px-3 py-2
              text-xs font-medium text-white transition-colors hover:bg-vendor-600
              disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button
            onClick={onPreview}
            className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2
              text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {isFailed && (
            <button
              onClick={onPrint}
              className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2
                text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Print Settings Modal ── */
const PrintSettingsModal: FC<{
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
}> = ({ open, onClose, onPrint }) => {
  const [copies, setCopies] = useState(1);
  const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [includeReceipt, setIncludeReceipt] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsPrinting(false);
    onPrint();
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

            {/* Copies */}
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

            {/* Paper size */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Paper Size</label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Standard Ticket (80mm x 150mm)
              </div>
            </div>

            {/* Print quality */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Print Quality</label>
              <div className="flex gap-2">
                {(['draft', 'standard', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors
                      ${quality === q
                        ? 'border-vendor-500 bg-vendor-50 text-vendor-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Include receipt */}
            <label className="mb-5 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={includeReceipt}
                onChange={(e) => setIncludeReceipt(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-vendor-500 focus:ring-vendor-500"
              />
              <span className="text-sm text-gray-700">Include receipt</span>
            </label>

            {/* Actions */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-vendor-500
                text-base font-semibold text-white transition-colors hover:bg-vendor-600
                disabled:cursor-not-allowed disabled:opacity-60"
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
            <button
              onClick={onClose}
              className="mt-2 flex h-10 w-full items-center justify-center rounded-xl border border-gray-300
                text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
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
            className="w-full max-w-lg rounded-2xl bg-white p-0 shadow-elevated overflow-hidden"
          >
            {/* Full-size ticket template */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-vendor-500 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vendor-500">
                    <Printer className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900">EduResult Pro</h3>
                    <p className="text-[10px] text-gray-500">Official Interview Ticket</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-vendor-700">{ticket.ticketNumber}</p>
                </div>
              </div>

              {/* School banner */}
              <div className="mb-4 rounded-lg bg-vendor-500 px-4 py-3 text-center text-white">
                <h4 className="text-lg font-bold">{ticket.schoolName}</h4>
              </div>

              {/* Student details */}
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

              {/* QR Code area */}
              <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gray-100">
                  <QrCode className="h-24 w-24 text-gray-800" />
                </div>
                <p className="mt-2 font-mono text-xs text-gray-500">{ticket.qrCode}</p>
              </div>

              {/* Footer */}
              <div className="mt-4 border-t border-gray-200 pt-3 text-center">
                <p className="text-[10px] text-gray-400">
                  This ticket is blockchain-verified and tamper-proof.
                  <br />
                  Bring a printed copy and original documents to the interview.
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600
                  transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 rounded-lg bg-vendor-500 px-4 py-2
                  text-sm font-medium text-white transition-colors hover:bg-vendor-600"
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
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [tickets, setTickets] = useState<TicketView[]>(allTickets);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<TicketView | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [printedCount, setPrintedCount] = useState(45);
  const [auditPage, setAuditPage] = useState(0);

  const maxQuota = 100;

  const filteredTickets = tickets.filter((t) => {
    switch (activeTab) {
      case 'ready': return t.status === 'generated' || t.status === 'downloaded';
      case 'printed': return t.status === 'printed';
      case 'failed': return !!t.failureReason;
      default: return true;
    }
  });

  const readyCount = tickets.filter((t) => t.status === 'generated' || t.status === 'downloaded').length;
  const printedCountActual = tickets.filter((t) => t.status === 'printed').length;
  const failedCount = tickets.filter((t) => !!t.failureReason).length;

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
      ids.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const handlePrint = useCallback(() => {
    setPrintModalOpen(true);
  }, []);

  const handlePrintConfirm = useCallback(() => {
    setTickets((prev) =>
      prev.map((t) =>
        selectedIds.has(t.id) || t.id === previewTicket?.id
          ? { ...t, status: 'printed' as const, printedBy: 'Ramesh Kumar', printedAt: new Date().toISOString() }
          : t
      )
    );
    setPrintedCount((c) => Math.min(c + (selectedIds.size || 1), maxQuota));
    setSelectedIds(new Set());
    setPreviewTicket(null);
    setPreviewOpen(false);
  }, [selectedIds, previewTicket]);

  const openPreview = (ticket: TicketView) => {
    setPreviewTicket(ticket);
    setPreviewOpen(true);
  };

  const handleBatchPrint = () => {
    if (selectedIds.size === 0) return;
    setPrintModalOpen(true);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tickets.length },
    { key: 'ready', label: 'Ready to Print', count: readyCount },
    { key: 'printed', label: 'Printed', count: printedCountActual },
    { key: 'failed', label: 'Failed', count: failedCount },
  ];

  return (
    <Layout zone="vendor">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Ticket Printing</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and print interview tickets</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()); }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                  ${batchMode
                    ? 'border-vendor-300 bg-vendor-50 text-vendor-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {batchMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Batch Mode
              </button>
            </div>
          </div>

          {/* Print Quota */}
          <div className="mb-6">
            <PrintQuotaBar printed={printedCount} max={maxQuota} />
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors
                  ${activeTab === tab.key
                    ? 'bg-vendor-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Batch controls */}
          <AnimatePresence>
            {batchMode && activeTab === 'ready' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-3"
              >
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2
                    text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {filteredTickets.every((t) => selectedIds.has(t.id)) ? (
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
                    onClick={handleBatchPrint}
                    className="flex items-center gap-1.5 rounded-lg bg-vendor-500 px-4 py-2
                      text-sm font-medium text-white transition-colors hover:bg-vendor-600"
                  >
                    <Printer className="h-4 w-4" />
                    Print Selected ({selectedIds.size})
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tickets Grid */}
          <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket, i) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                index={i}
                batchMode={batchMode && activeTab === 'ready'}
                selected={selectedIds.has(ticket.id)}
                onSelect={() => handleSelect(ticket.id)}
                onPreview={() => openPreview(ticket)}
                onPrint={() => { setPreviewTicket(ticket); handlePrint(); }}
              />
            ))}
            {filteredTickets.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                No tickets found for this filter
              </div>
            )}
          </div>

          {/* Anti-Fraud Audit Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-vendor-600" />
                <h2 className="text-lg font-semibold text-gray-900">Print Audit Log</h2>
                <span className="flex items-center gap-1 rounded-full bg-vendor-50 px-2 py-0.5 text-xs font-medium text-vendor-700">
                  <Shield className="h-3 w-3" />
                  Tamper-proof
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Downloading CSV...')}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2
                    text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Log
                </button>
                <button
                  onClick={() => alert('Blockchain verification coming soon')}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium
                    text-vendor-600 transition-colors hover:bg-vendor-50"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Blockchain Proof
                </button>
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Ticket #</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">School</th>
                    <th className="px-4 py-3">Printed By</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.slice(auditPage * 5, auditPage * 5 + 5).map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50
                        ${i % 5 === 4 ? 'bg-gray-50/50' : ''}
                      `}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.timestamp}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.ticketNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.parentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.schoolName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{entry.printedBy}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          ${entry.status === 'Printed' ? 'bg-emerald-100 text-emerald-600' :
                            entry.status === 'Reprint' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'}
                        `}>
                          {entry.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <span className="text-xs text-gray-400">
                Showing {auditPage * 5 + 1}-{Math.min((auditPage + 1) * 5, auditEntries.length)} of {auditEntries.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                  disabled={auditPage === 0}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAuditPage((p) => Math.min(Math.ceil(auditEntries.length / 5) - 1, p + 1))}
                  disabled={auditPage >= Math.ceil(auditEntries.length / 5) - 1}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Blockchain hash footer */}
            <div className="border-t border-gray-100 px-6 py-3 text-center">
              <p className="font-mono text-[10px] text-gray-400">
                Current block hash: 0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <PrintSettingsModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        onPrint={handlePrintConfirm}
      />
      <TicketPreviewModal
        open={previewOpen}
        ticket={previewTicket}
        onClose={() => { setPreviewOpen(false); setPreviewTicket(null); }}
        onPrint={() => { setPreviewOpen(false); handlePrintConfirm(); }}
      />
    </Layout>
  );
};

export default VendorTicketPrintingPage;
