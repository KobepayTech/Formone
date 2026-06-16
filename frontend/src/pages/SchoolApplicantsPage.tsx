import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, IndianRupee, FileCheck, Clock, Search, ChevronDown,
  Eye, CalendarPlus, X, Phone, Mail, MapPin, FileText,
  TrendingUp, TrendingDown, Minus, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { applications, transactions, vendors, studentProfiles } from '@/lib/mockData';
import type { Application } from '@/types';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type SortKey = 'studentName' | 'totalAmount' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface Filters {
  search: string;
  formType: string;
  paymentStatus: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const SCHOOL_ID = 'sch_001';
const SCHOOL_NAME = 'Delhi Public School';

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDateTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (n: number) => `TZS ${n.toLocaleString('en-IN')}`;

const getVendorName = (id?: string) => vendors.find(v => v.id === id)?.name ?? '—';

const getTransactionForApp = (appId: string) => transactions.find(t => t.applicationId === appId);

const getStudentProfile = (studentId: string) => studentProfiles.find(s => s.id === studentId);

const formTypeLabel = (ft: string) => ft.charAt(0).toUpperCase() + ft.slice(1);

/* ── Stat Card ─────────────────────────────────────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, trend, trendValue, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  accent: string;
}) => (
  <motion.div
    className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`rounded-lg p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${
        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
      }`}>
        {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : trend === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {trendValue}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

/* ── Applicant Detail Drawer ───────────────────────────────────────────────── */

const ApplicantDrawer = ({ app, onClose }: { app: Application; onClose: () => void }) => {
  const student = getStudentProfile(app.studentId);
  const txn = getTransactionForApp(app.id);
  const vendor = vendors.find(v => v.id === app.assignedVendorId);

  return (
    <motion.div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    >
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 -z-10" onClick={onClose} />

      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-gray-900">Applicant Details</h2>
        <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Student info header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold">
            {app.studentName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{app.studentName}</h3>
            <p className="text-sm font-mono text-violet-600">{app.submissionId}</p>
            <StatusBadge status={app.status} type="application" />
          </div>
        </div>

        {/* Contact Details */}
        {student && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" /> Contact Details
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-gray-400" /><span>{student.parentPhone}</span></div>
              <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-gray-400" /><span>{student.parentEmail}</span></div>
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-gray-400" /><span>{student.address}, {student.city}</span></div>
            </div>
          </div>
        )}

        {/* Application Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" /> Application Details
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Form Type</span><span className="font-medium">{formTypeLabel(app.formType)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">School</span><span className="font-medium">{app.schoolName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Applied Date</span><span className="font-medium">{formatDate(app.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{formatCurrency(app.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><StatusBadge status={app.paymentStatus} type="payment" /></div>
          </div>
        </div>

        {/* Payment Info */}
        {txn && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-gray-400" /> Payment Info
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-medium">{formatCurrency(txn.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium">{vendor?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-mono text-xs">{txn.transactionId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Timestamp</span><span>{formatDateTime(txn.createdAt)}</span></div>
            </div>
          </div>
        )}

        {/* Interview Status */}
        {app.tickets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-gray-400" /> Interview Details
            </h4>
            <div className="bg-violet-50 rounded-lg p-4 space-y-2 text-sm border border-violet-100">
              {app.tickets.map(ticket => (
                <div key={ticket.id}>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{formatDate(ticket.interviewDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{ticket.interviewTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{ticket.venue}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ticket #</span><span className="font-mono text-xs text-violet-600">{ticket.ticketNumber}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {student && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Documents Submitted</h4>
            <div className="space-y-2">
              {app.documentsSubmitted.length > 0 ? app.documentsSubmitted.map((docId, i) => (
                <div key={docId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-500" />
                    <span className="text-sm">Document {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <StatusBadge status="verified" type="document" />
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">No documents submitted yet</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 transition-colors flex items-center justify-center gap-2">
            <CalendarPlus className="h-4 w-4" /> Schedule Interview
          </button>
        </div>
      </div>
    </motion.div>
  );
};


/* ── Main Page ─────────────────────────────────────────────────────────────── */

export default function SchoolApplicantsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '', formType: '', paymentStatus: '', status: '', dateFrom: '', dateTo: '',
  });
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Filter apps for this school
  const schoolApps = useMemo(() => applications.filter(a => a.schoolId === SCHOOL_ID), []);

  const filteredApps = useMemo(() => {
    let data = [...schoolApps];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.submissionId.toLowerCase().includes(q)
      );
    }
    if (filters.formType) data = data.filter(a => a.formType === filters.formType);
    if (filters.paymentStatus) data = data.filter(a => a.paymentStatus === filters.paymentStatus);
    if (filters.status) data = data.filter(a => a.status === filters.status);
    if (filters.dateFrom) data = data.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom));
    if (filters.dateTo) data = data.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo));

    data.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'studentName') return dir * a.studentName.localeCompare(b.studentName);
      if (sort.key === 'totalAmount') return dir * (a.totalAmount - b.totalAmount);
      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return data;
  }, [schoolApps, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / perPage));
  const pagedApps = filteredApps.slice((page - 1) * perPage, page * perPage);

  // Stats
  const stats = useMemo(() => {
    const totalApps = schoolApps.length;
    const confirmedPayments = schoolApps.filter(a => a.paymentStatus === 'completed').length;
    const revenue = transactions
      .filter(t => t.schoolId === SCHOOL_ID && t.status === 'completed' && t.amount > 0)
      .reduce((s, t) => s + t.schoolRevenue, 0);
    const interviewScheduled = schoolApps.filter(a => a.status === 'interview_scheduled').length;
    return { totalApps, confirmedPayments, revenue, interviewScheduled };
  }, [schoolApps]);

  // Revenue summary
  const revenueSummary = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const txns = transactions.filter(t => t.schoolId === SCHOOL_ID && t.status === 'completed' && t.amount > 0);
    return {
      today: txns.filter(t => new Date(t.createdAt) >= dayStart).reduce((s, t) => s + t.schoolRevenue, 0),
      week: txns.filter(t => new Date(t.createdAt) >= weekStart).reduce((s, t) => s + t.schoolRevenue, 0),
      month: txns.filter(t => new Date(t.createdAt) >= monthStart).reduce((s, t) => s + t.schoolRevenue, 0),
    };
  }, []);

  const toggleSort = (key: SortKey) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ChevronDown className={`h-3.5 w-3.5 ml-1 inline transition-transform ${sort.key === col ? (sort.dir === 'asc' ? 'rotate-180' : '') : 'text-gray-300'}`} />
  );

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const clearFilters = () => setFilters({ search: '', formType: '', paymentStatus: '', status: '', dateFrom: '', dateTo: '' });

  const rowBg = (status: string) => {
    if (status === 'accepted') return 'bg-green-50/50';
    if (status === 'rejected') return 'bg-red-50/50';
    if (status === 'pending_payment' || status === 'under_review') return 'bg-amber-50/50';
    return '';
  };

  return (
    <Layout zone="school">
      <div className="min-h-[calc(100dvh-72px-200px)] bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{SCHOOL_NAME} — Manage applications, payments, and interviews</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="Total Applicants" value={String(stats.totalApps)} trend="up" trendValue="12%" accent="bg-violet-100 text-violet-600" />
            <StatCard icon={FileCheck} label="Confirmed Payments" value={String(stats.confirmedPayments)} trend="up" trendValue="8%" accent="bg-green-100 text-green-600" />
            <StatCard icon={IndianRupee} label="Revenue Generated" value={formatCurrency(stats.revenue)} trend="up" trendValue="15%" accent="bg-emerald-100 text-emerald-600" />
            <StatCard icon={Clock} label="Interview Scheduled" value={String(stats.interviewScheduled)} trend="neutral" trendValue="0%" accent="bg-amber-100 text-amber-600" />
          </div>

          {/* Filters */}
          <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, reg. number..."
                    value={filters.search}
                    onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>
              <select value={filters.formType} onChange={e => { setFilters(f => ({ ...f, formType: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
                <option value="">All Form Types</option>
                <option value="admission">Admission</option>
                <option value="transfer">Transfer</option>
                <option value="scholarship">Scholarship</option>
                <option value="enquiry">Enquiry</option>
              </select>
              <select value={filters.paymentStatus} onChange={e => { setFilters(f => ({ ...f, paymentStatus: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
                <option value="">All Payment Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all">
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="paid">Paid</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Clear All
                </button>
              )}
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Table */}
            <div className="flex-1">
              <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-violet-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Reg. #</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:text-violet-600 transition-colors" onClick={() => toggleSort('studentName')}>
                          Student Name <SortIcon col="studentName" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Form Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:text-violet-600 transition-colors" onClick={() => toggleSort('totalAmount')}>
                          Amount <SortIcon col="totalAmount" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Vendor</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:text-violet-600 transition-colors" onClick={() => toggleSort('createdAt')}>
                          Date <SortIcon col="createdAt" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {pagedApps.map((app, idx) => (
                          <motion.tr
                            key={app.id}
                            className={`border-b border-gray-100 hover:bg-violet-50/40 transition-colors ${rowBg(app.status)}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <td className="px-4 py-3 font-mono text-xs text-violet-600">{app.submissionId}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{app.studentName}</p>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={app.formType} type="application" /></td>
                            <td className="px-4 py-3 font-mono font-semibold text-gray-900">{formatCurrency(app.totalAmount)}</td>
                            <td className="px-4 py-3 text-gray-600">{getVendorName(app.assignedVendorId)}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(app.createdAt)}</td>
                            <td className="px-4 py-3"><StatusBadge status={app.status} type="application" /></td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {pagedApps.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No applicants match your filters</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Rows per page:</span>
                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700">
                      {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-xs text-gray-500 ml-2">
                      Showing {Math.min((page - 1) * perPage + 1, filteredApps.length)}-{Math.min(page * perPage, filteredApps.length)} of {filteredApps.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${page === p ? 'bg-violet-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Revenue Summary Sidebar */}
            <motion.div className="w-full lg:w-64 flex-shrink-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-violet-500" /> Revenue Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Today</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueSummary.today)}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">This Week</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueSummary.week)}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">This Month</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueSummary.month)}</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} />
            <ApplicantDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
