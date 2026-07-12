import { useState, useEffect, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Ticket,
  Users,
  Wallet,
  TrendingUp,
  Radio,
  CircleDot,
  Clock,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/currency';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { vendorService, type VendorQueueItem, type VendorTransaction } from '@/lib/api';

const TOKEN_COST = 10;
const MAX_TOKENS = 5000;

/* ── Types ── */
interface QueueItem {
  id: string;
  submissionId: string;
  time: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentId: string;
  schoolsCount: number;
  amount: number;
  tokenCost: number;
  status: 'Waiting';
}

const toQueueItem = (app: VendorQueueItem): QueueItem => ({
  id: app.id,
  submissionId: app.submissionId,
  time: new Date(app.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  parentName: app.studentProfile.parentName,
  parentPhone: app.studentProfile.parentPhone,
  studentName: `${app.studentProfile.firstName} ${app.studentProfile.lastName}`,
  studentId: app.studentProfile.universalStudentId,
  schoolsCount: 1,
  amount: app.totalAmount,
  tokenCost: TOKEN_COST,
  status: 'Waiting',
});

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

/* ── Stat Card Component ── */
const StatCard: FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  index: number;
}> = ({ icon: Icon, label, value, index }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200
      hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
  >
    <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vendor-50">
        <Icon className="h-5 w-5 text-vendor-500" />
      </div>
      <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
        <TrendingUp className="h-3 w-3" />
        Today
      </div>
    </div>
    <div className="mt-3">
      <div className="font-display text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  </motion.div>
);

/* ── Queue Table Row ── */
const QueueRow: FC<{ item: QueueItem; index: number }> = ({ item, index }) => {
  const navigate = useNavigate();
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
    >
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.time}</td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{item.parentName}</div>
        <div className="text-xs text-gray-400">{item.parentPhone}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-700">{item.studentName}</div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          <CreditCard className="h-3 w-3" />
          {item.schoolsCount} school{item.schoolsCount > 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500">-{item.tokenCost} tokens</td>
      <td className="px-4 py-3">
        <StatusBadge status="pending" type="payment" />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => navigate('/vendor/payments')}
          className="rounded-md bg-vendor-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-vendor-600 active:scale-[0.98]"
        >
          Process
        </button>
      </td>
    </motion.tr>
  );
};

/* ── Main Page Component ── */
const VendorDashboardPage: FC = () => {
  const navigate = useNavigate();

  const { data: dashboard, loading, error, refetch } = useApi(
    useCallback(() => vendorService.dashboard(), []),
    []
  );
  const { data: queueData } = useApi<VendorQueueItem[]>(useCallback(() => vendorService.queue(), []), []);
  const { data: history } = useApi<VendorTransaction[]>(useCallback(() => vendorService.history(1, 5), []), []);

  const [tokenBalance, setTokenBalance] = useState(0);
  useEffect(() => {
    if (dashboard) setTokenBalance(dashboard.tokenBalance);
  }, [dashboard]);

  const queue = (queueData ?? []).map(toQueueItem);
  const recentTxns = history ?? [];
  const tokenPercent = Math.min(100, (tokenBalance / MAX_TOKENS) * 100);

  const getTokenMeterColor = () => {
    if (tokenPercent > 50) return 'bg-vendor-500';
    if (tokenPercent > 20) return 'bg-amber-400';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Layout zone="vendor">
        <LoadingState label="Loading dashboard…" />
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Your collections and payment queue</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Banknote} label="Payments Collected Today" value={formatCurrency(dashboard?.todayCollections ?? 0)} index={0} />
            <StatCard icon={Ticket} label="Tickets Printed Today" value={String(dashboard?.ticketsToday ?? 0)} index={1} />
            <StatCard icon={Users} label="Payments Today" value={String(dashboard?.todayCount ?? 0)} index={2} />
            <StatCard icon={Wallet} label="Token Balance" value={tokenBalance.toLocaleString()} index={3} />
          </div>

          {/* Token Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`mb-6 rounded-2xl border p-6 transition-all duration-300
              ${tokenBalance < 200 ? 'border-amber-200 bg-amber-50/50' : 'border-vendor-200 bg-vendor-50/50'}
            `}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Available Token Balance</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-vendor-700">{tokenBalance.toLocaleString()}</span>
                  <span className="text-base font-medium text-vendor-600">Tokens</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">~ {formatCurrency(tokenBalance * TOKEN_COST)} processing capacity</p>
              </div>

              <div className="flex-1 max-w-md">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Token Meter</span>
                  <span className="text-xs font-semibold text-gray-700">{Math.round(tokenPercent)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className={`h-full rounded-full ${getTokenMeterColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${tokenPercent}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span className={tokenPercent <= 20 ? 'font-medium text-red-500' : ''}>Low at 20%</span>
                  <span>{MAX_TOKENS.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Request More Tokens
                </button>
              </div>
            </div>

            <AnimatePresence>
              {tokenBalance < 200 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2.5 text-sm text-amber-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Low token balance! Request more tokens soon.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Payment Queue</h2>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <CircleDot className="h-3 w-3 animate-pulse" />
                  {queue.length} pending
                </span>
              </div>
              <button onClick={() => navigate('/vendor/payments')} className="text-xs font-medium text-vendor-600 hover:text-vendor-700">
                Open terminal →
              </button>
            </div>

            {/* Queue Table (desktop) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Schools</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Token Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length > 0 ? (
                    queue.map((item, i) => <QueueRow key={item.id} item={item} index={i} />)
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                        No pending submissions in queue
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Queue Cards (mobile) */}
            <div className="divide-y divide-gray-100 md:hidden">
              {queue.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.parentName}</p>
                      <p className="text-xs text-gray-400">{item.studentName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-400">{item.schoolsCount} schools</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/vendor/payments')}
                      className="w-full rounded-md bg-vendor-500 py-2 text-sm font-medium text-white transition-colors hover:bg-vendor-600"
                    >
                      Process Payment
                    </button>
                  </div>
                </motion.div>
              ))}
              {queue.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">No pending submissions in queue</div>
              )}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTxns.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-gray-400">No transactions yet</div>
              )}
              {recentTxns.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-sm text-gray-700">{txn.school?.name ?? 'Form payment'}</p>
                      <p className="text-xs text-gray-400">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(txn.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        <span className="ml-2 uppercase">{txn.paymentMethod}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-gray-900">{formatCurrency(txn.totalAmount)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboardPage;
