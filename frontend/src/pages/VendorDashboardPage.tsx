import { useState, useEffect, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Ticket,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Radio,
  CircleDot,
  Clock,
  Bell,
  X,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { applications, vendors, transactions, interviewTickets } from '@/lib/mockData';

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
  status: 'Waiting' | 'Paying' | 'Completed';
  isNew?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  action?: string;
}

/* ── Hourly earnings data ── */
const hourlyData = [
  { hour: '9 AM', amount: 1200 },
  { hour: '10 AM', amount: 1850 },
  { hour: '11 AM', amount: 2400 },
  { hour: '12 PM', amount: 1100 },
  { hour: '1 PM', amount: 800 },
  { hour: '2 PM', amount: 2100 },
  { hour: '3 PM', amount: 2800 },
  { hour: '4 PM', amount: 950 },
];

/* ── Generate queue from mock data ── */
const generateQueue = (): QueueItem[] => {
  const pendingApps = applications.filter(
    (a) => a.paymentStatus === 'pending' && a.status === 'pending_payment'
  );

  return pendingApps.map((app) => ({
    id: app.id,
    submissionId: app.submissionId,
    time: new Date(app.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    parentName: 'Parent', // derived from student profile
    parentPhone: '+91-98XXX-XXXXX',
    studentName: app.studentName,
    studentId: app.studentId,
    schoolsCount: 1,
    amount: app.totalAmount,
    tokenCost: Math.ceil(app.totalAmount / 10),
    status: 'Waiting' as const,
  }));
};

const parentNames = [
  'Rahul Sharma', 'Priya Patel', 'Vikram Singh', 'Sunita Devi',
  'Amit Kumar', 'Meera Joshi', 'Rajesh Gupta', 'Deepa Reddy',
];

const parentPhones = [
  '+91 98765 43210', '+91 98765 43211', '+91 98765 43212', '+91 98765 43213',
  '+91 98765 43214', '+91 98765 43215', '+91 98765 43216', '+91 98765 43217',
];

// Enrich queue items with parent data
const enrichQueue = (items: QueueItem[]): QueueItem[] =>
  items.map((item, i) => ({
    ...item,
    parentName: parentNames[i % parentNames.length],
    parentPhone: parentPhones[i % parentPhones.length],
    schoolsCount: Math.floor(Math.random() * 4) + 1,
  }));

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const slideInRight = {
  hidden: { opacity: 0, x: 120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    x: 120,
    transition: { duration: 0.2 },
  },
};

/* ── Stat Card Component ── */
const StatCard: FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  index: number;
}> = ({ icon: Icon, label, value, trend, trendUp, index }) => (
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
      <div className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {trend}
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
      className={`border-b border-gray-100 transition-colors hover:bg-gray-50
        ${item.isNew ? 'bg-vendor-50 animate-pulse' : ''}
      `}
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
      <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">
        Rs. {item.amount.toLocaleString('en-IN')}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500">
        -{item.tokenCost} tokens
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={item.status === 'Waiting' ? 'pending' : item.status === 'Paying' ? 'completed' : 'completed'} type="payment" />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => navigate('/vendor/payments')}
          className="rounded-md bg-vendor-500 px-3 py-1.5 text-xs font-medium text-white
            transition-colors hover:bg-vendor-600 active:scale-[0.98]"
        >
          {item.status === 'Waiting' ? 'Process' : 'View'}
        </button>
      </td>
    </motion.tr>
  );
};

/* ── Main Page Component ── */
const VendorDashboardPage: FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueItem[]>(() => enrichQueue(generateQueue()));
  const [tokenBalance, setTokenBalance] = useState(vendors[0].tokenBalance);
  const [refreshTick, setRefreshTick] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const maxTokens = 2000;
  const tokenPercent = (tokenBalance / maxTokens) * 100;

  // Add demo notifications periodically
  const showNotification = useCallback((notif: NotificationItem) => {
    setNotifications((prev) => [...prev, notif]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 6000);
  }, []);

  // Auto-refresh queue every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((t) => t + 1);
      // Simulate new submissions arriving
      if (Math.random() > 0.6 && queue.length < 8) {
        const newItems: QueueItem[] = [
          {
            id: `app_${Date.now()}`,
            submissionId: `APP-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            parentName: parentNames[Math.floor(Math.random() * parentNames.length)],
            parentPhone: parentPhones[Math.floor(Math.random() * parentPhones.length)],
            studentName: 'New Student',
            studentId: `stu_${Date.now()}`,
            schoolsCount: Math.floor(Math.random() * 3) + 1,
            amount: Math.floor(Math.random() * 1000) + 200,
            tokenCost: Math.floor(Math.random() * 50) + 20,
            status: 'Waiting',
            isNew: true,
          },
        ];
        setQueue((prev) => [...newItems, ...prev]);
        showNotification({
          id: `notif_${Date.now()}`,
          title: `New submission from ${newItems[0].parentName}`,
          message: `${newItems[0].schoolsCount} schools, Rs. ${newItems[0].amount}`,
          action: 'Process now',
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [queue.length, showNotification]);

  // Remove "isNew" highlight after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueue((prev) => prev.map((item) => ({ ...item, isNew: false })));
    }, 5000);
    return () => clearTimeout(timer);
  }, [refreshTick]);

  // Today's completed transactions
  const todayTxns = transactions
    .filter((t) => t.status === 'completed' && t.type === 'form_sale')
    .slice(0, 5);

  const totalCollected = todayTxns.reduce((sum, t) => sum + t.amount, 0);
  const ticketsPrinted = interviewTickets.filter((t) => t.status === 'printed').length;
  const parentsServed = new Set(todayTxns.map((t) => t.parentId)).size;

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Token meter color
  const getTokenMeterColor = () => {
    if (tokenPercent > 50) return 'bg-vendor-500';
    if (tokenPercent > 20) return 'bg-amber-400';
    return 'bg-red-500';
  };

  return (
    <Layout zone="vendor">
      {/* Notification popups */}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto w-80 rounded-xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vendor-100">
                  <Bell className="h-4 w-4 text-vendor-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
                  <p className="mt-0.5 text-xs text-gray-500">{notif.message}</p>
                  {notif.action && (
                    <button
                      onClick={() => navigate('/vendor/payments')}
                      className="mt-2 text-xs font-medium text-vendor-600 hover:text-vendor-700"
                    >
                      {notif.action} →
                    </button>
                  )}
                </div>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header with live indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {vendors[0].name}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={IndianRupee}
              label="Payments Collected Today"
              value={`Rs. ${(totalCollected || 12450).toLocaleString('en-IN')}`}
              trend="+18%"
              trendUp
              index={0}
            />
            <StatCard
              icon={Ticket}
              label="Tickets Printed"
              value={String(ticketsPrinted || 47)}
              trend="+12%"
              trendUp
              index={1}
            />
            <StatCard
              icon={Users}
              label="Parents Served"
              value={String(parentsServed || 23)}
              trend="+25%"
              trendUp
              index={2}
            />
            <StatCard
              icon={Wallet}
              label="Token Balance"
              value={String(tokenBalance.toLocaleString('en-IN'))}
              trend={tokenPercent > 50 ? '+5%' : '-10%'}
              trendUp={tokenPercent > 50}
              index={3}
            />
          </div>

          {/* Token Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`mb-6 rounded-2xl border p-6 transition-all duration-300
              ${tokenBalance < 200
                ? 'border-amber-200 bg-amber-50/50'
                : 'border-vendor-200 bg-vendor-50/50'
              }
            `}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left - Balance */}
              <div className="flex-1">
                <p className="text-sm text-gray-500">Available Token Balance</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-vendor-700">
                    {tokenBalance.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base font-medium text-vendor-600">Tokens</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">~ Rs. {(tokenBalance * 10).toLocaleString('en-IN')} value</p>
              </div>

              {/* Center - Meter */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Token Meter</span>
                  <span className="text-xs font-semibold text-gray-700">{Math.round(tokenPercent)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${getTokenMeterColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${tokenPercent}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span className={tokenPercent <= 20 ? 'text-red-500 font-medium' : ''}>Low at 20%</span>
                  <span>{maxTokens.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTokenBalance((b) => Math.min(b + 500, maxTokens))}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700
                    transition-colors hover:bg-gray-50"
                >
                  Request More Tokens
                </button>
                <button
                  onClick={() => alert('Token history view coming soon')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600
                    transition-colors hover:bg-white/60"
                >
                  View History
                </button>
                <button
                  onClick={() => alert('Redeem tokens coming soon')}
                  disabled={tokenBalance < 500}
                  className="rounded-lg bg-vendor-500 px-4 py-2 text-sm font-medium text-white
                    shadow-[0_4px_14px_rgba(16,185,129,0.3)]
                    transition-colors hover:bg-vendor-600
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Recharge
                </button>
              </div>
            </div>

            {/* Low balance warning */}
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
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-400">New submissions appear in real-time</p>
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
                    queue.map((item, i) => (
                      <QueueRow key={item.id} item={item} index={i} />
                    ))
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
                      <p className="text-sm font-semibold text-gray-900">Rs. {item.amount}</p>
                      <p className="text-xs text-gray-400">{item.schoolsCount} schools</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/vendor/payments')}
                      className="w-full rounded-md bg-vendor-500 py-2 text-sm font-medium text-white
                        transition-colors hover:bg-vendor-600"
                    >
                      Process Payment
                    </button>
                  </div>
                </motion.div>
              ))}
              {queue.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No pending submissions in queue
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom Section: Transactions + Earnings Chart */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:col-span-2"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <button
                  onClick={() => alert('View all transactions coming soon')}
                  className="text-sm font-medium text-vendor-600 hover:text-vendor-700"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {todayTxns.map((txn, i) => (
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
                        <p className="text-sm text-gray-700">{txn.description}</p>
                        <p className="text-xs text-gray-400">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(txn.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      Rs. {txn.amount.toLocaleString('en-IN')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Earnings Mini-Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Hourly Earnings</h2>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyData}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `Rs.${v}`}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value: number) => [`Rs. ${value.toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {hourlyData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 6 ? '#059669' : '#10B981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboardPage;
