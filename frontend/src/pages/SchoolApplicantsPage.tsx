import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Coins, FileCheck, Clock, Search, ChevronDown,
  Eye, CalendarPlus, X, Phone, Mail, FileText,
  TrendingUp, Minus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/currency';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { schoolAdminService, type SchoolApplicant } from '@/lib/api';

/* ── Types ─────────────────────────────────────────────────────────────────── */

type SortKey = 'studentName' | 'totalAmount' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface Filters {
  search: string;
  formType: string;
  paymentStatus: string;
  status: string;
}

interface ApplicantView {
  id: string;
  submissionId: string;
  studentName: string;
  universalStudentId: string;
  parentPhone: string;
  parentEmail: string;
  formType: string;
  totalAmount: number;
  vendorName: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
}

const toView = (a: SchoolApplicant): ApplicantView => ({
  id: a.id,
  submissionId: a.submissionId,
  studentName: `${a.studentProfile.firstName} ${a.studentProfile.lastName}`,
  universalStudentId: a.studentProfile.universalStudentId,
  parentPhone: a.studentProfile.parentPhone,
  parentEmail: a.studentProfile.parentEmail,
  formType: a.formType,
  totalAmount: a.totalAmount,
  vendorName: a.vendor?.name ?? '—',
  createdAt: a.createdAt,
  status: a.status,
  paymentStatus: a.paymentStatus,
});

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const formTypeLabel = (ft: string) => ft.charAt(0).toUpperCase() + ft.slice(1);

/* ── Stat Card ─────────────────────────────────────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, trend, trendValue, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: 'up' | 'neutral';
  trendValue: string;
  accent: string;
}) => (
  <motion.div
    className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
  >
    <div className="mb-3 flex items-start justify-between">
      <div className={`rounded-lg p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
        {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        {trendValue}
      </div>
    </div>
    <p className="mb-0.5 text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

/* ── Applicant Detail Drawer ───────────────────────────────────────────────── */

const ApplicantDrawer = ({ app, onClose, onSchedule }: { app: ApplicantView; onClose: () => void; onSchedule: () => void }) => (
  <motion.div
    className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-2xl"
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
  >
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900">Applicant Details</h2>
      <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">
          {app.studentName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{app.studentName}</h3>
          <p className="font-mono text-sm text-violet-600">{app.submissionId}</p>
          <StatusBadge status={app.status} type="application" />
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Phone className="h-4 w-4 text-gray-400" /> Contact Details
        </h4>
        <div className="space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-gray-400" /><span>{app.parentPhone}</span></div>
          <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-gray-400" /><span>{app.parentEmail}</span></div>
          <div className="flex items-center gap-2 text-sm"><Users className="h-3.5 w-3.5 text-gray-400" /><span className="font-mono text-xs">{app.universalStudentId}</span></div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4 text-gray-400" /> Application Details
        </h4>
        <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Form Type</span><span className="font-medium">{formTypeLabel(app.formType)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Applied Date</span><span className="font-medium">{formatDate(app.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{formatCurrency(app.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium">{app.vendorName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment</span><StatusBadge status={app.paymentStatus} type="payment" /></div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onSchedule}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
        >
          <CalendarPlus className="h-4 w-4" /> Schedule Interview
        </button>
      </div>
    </div>
  </motion.div>
);

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export default function SchoolApplicantsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ search: '', formType: '', paymentStatus: '', status: '' });
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedApp, setSelectedApp] = useState<ApplicantView | null>(null);

  const fetchApplicants = useCallback(
    () => schoolAdminService.applicants({
      status: filters.status,
      formType: filters.formType,
      paymentStatus: filters.paymentStatus,
      search: filters.search,
      limit: 100,
    }),
    [filters.status, filters.formType, filters.paymentStatus, filters.search]
  );
  const { data, loading, error, refetch } = useApi<SchoolApplicant[]>(
    fetchApplicants,
    [filters.status, filters.formType, filters.paymentStatus, filters.search]
  );
  const { data: revenue } = useApi(useCallback(() => schoolAdminService.revenue(), []), []);

  const applicants = useMemo(() => (data ?? []).map(toView), [data]);

  const sortedApps = useMemo(() => {
    const rows = [...applicants];
    rows.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'studentName') return dir * a.studentName.localeCompare(b.studentName);
      if (sort.key === 'totalAmount') return dir * (a.totalAmount - b.totalAmount);
      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    return rows;
  }, [applicants, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedApps.length / perPage));
  const pagedApps = sortedApps.slice((page - 1) * perPage, page * perPage);

  const stats = {
    totalApps: applicants.length,
    confirmedPayments: applicants.filter((a) => a.paymentStatus === 'completed').length,
    revenue: revenue?.thisMonth.revenue ?? 0,
    interviewScheduled: applicants.filter((a) => a.status === 'interview_scheduled').length,
  };

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ChevronDown className={`ml-1 inline h-3.5 w-3.5 transition-transform ${sort.key === col ? (sort.dir === 'asc' ? 'rotate-180' : '') : 'text-gray-300'}`} />
  );

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');
  const clearFilters = () => setFilters({ search: '', formType: '', paymentStatus: '', status: '' });

  const rowBg = (status: string) => {
    if (status === 'accepted') return 'bg-green-50/50';
    if (status === 'rejected') return 'bg-red-50/50';
    if (status === 'payment_pending') return 'bg-amber-50/50';
    return '';
  };

  return (
    <Layout zone="school">
      <div className="min-h-[calc(100dvh-72px-200px)] bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage applications, payments, and interviews</p>
          </motion.div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Applicants" value={String(stats.totalApps)} trend="up" trendValue="live" accent="bg-violet-100 text-violet-600" />
            <StatCard icon={FileCheck} label="Confirmed Payments" value={String(stats.confirmedPayments)} trend="up" trendValue="live" accent="bg-green-100 text-green-600" />
            <StatCard icon={Coins} label="Revenue (Month)" value={formatCurrency(stats.revenue)} trend="up" trendValue="live" accent="bg-emerald-100 text-emerald-600" />
            <StatCard icon={Clock} label="Interviews Scheduled" value={String(stats.interviewScheduled)} trend="neutral" trendValue="" accent="bg-amber-100 text-amber-600" />
          </div>

          {/* Filters */}
          <motion.div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[200px] flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={filters.search}
                    onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
              <select value={filters.formType} onChange={(e) => { setFilters((f) => ({ ...f, formType: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                <option value="">All Form Types</option>
                <option value="admission">Admission</option>
                <option value="transfer">Transfer</option>
                <option value="scholarship">Scholarship</option>
                <option value="exam">Exam</option>
              </select>
              <select value={filters.paymentStatus} onChange={(e) => { setFilters((f) => ({ ...f, paymentStatus: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                <option value="">All Payment Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
                  Clear All
                </button>
              )}
            </div>
          </motion.div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Table */}
            <div className="flex-1">
              <motion.div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {loading ? (
                  <LoadingState label="Loading applicants…" />
                ) : error ? (
                  <ErrorState message={error} onRetry={refetch} />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-violet-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Reg. #</th>
                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:text-violet-600" onClick={() => toggleSort('studentName')}>
                              Student Name <SortIcon col="studentName" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Form Type</th>
                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:text-violet-600" onClick={() => toggleSort('totalAmount')}>
                              Amount <SortIcon col="totalAmount" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Vendor</th>
                            <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:text-violet-600" onClick={() => toggleSort('createdAt')}>
                              Date <SortIcon col="createdAt" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedApps.map((app, idx) => (
                            <motion.tr
                              key={app.id}
                              className={`border-b border-gray-100 transition-colors hover:bg-violet-50/40 ${rowBg(app.status)}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                            >
                              <td className="px-4 py-3 font-mono text-xs text-violet-600">{app.submissionId}</td>
                              <td className="px-4 py-3"><p className="font-medium text-gray-900">{app.studentName}</p></td>
                              <td className="px-4 py-3 text-gray-600">{formTypeLabel(app.formType)}</td>
                              <td className="px-4 py-3 font-mono font-semibold text-gray-900">{formatCurrency(app.totalAmount)}</td>
                              <td className="px-4 py-3 text-gray-600">{app.vendorName}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(app.createdAt)}</td>
                              <td className="px-4 py-3"><StatusBadge status={app.status} type="application" /></td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                          {pagedApps.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No applicants match your filters</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rows per page:</span>
                        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700">
                          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="ml-2 text-xs text-gray-500">
                          Showing {Math.min((page - 1) * perPage + 1, sortedApps.length)}-{Math.min(page * perPage, sortedApps.length)} of {sortedApps.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 8).map((p) => (
                          <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${page === p ? 'bg-violet-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                        ))}
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Revenue Summary Sidebar */}
            <motion.div className="w-full flex-shrink-0 lg:w-64" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Coins className="h-4 w-4 text-violet-500" /> Revenue Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Today</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenue?.today.revenue ?? 0)}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="mb-1 text-xs text-gray-500">This Week</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenue?.thisWeek.revenue ?? 0)}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="mb-1 text-xs text-gray-500">This Month</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(revenue?.thisMonth.revenue ?? 0)}</p>
                  </div>
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
            <motion.div className="fixed inset-0 z-40 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} />
            <ApplicantDrawer
              app={selectedApp}
              onClose={() => setSelectedApp(null)}
              onSchedule={() => navigate('/school/interviews')}
            />
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
