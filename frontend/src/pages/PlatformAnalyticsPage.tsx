import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  DollarSign, FileCheck, Activity, Building2, Store, UserCheck,
  TrendingUp, TrendingDown, Minus, Medal, CircleDot,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { transactions, schools, vendors, applications } from '@/lib/mockData';

/* ── hourly revenue data (8 AM – 8 PM) ────────────────────────────────────── */
const hourlyData = [
  { hour: '8 AM', revenue: 8200,  transactions: 12 },
  { hour: '9 AM', revenue: 15200, transactions: 23 },
  { hour: '10 AM', revenue: 42800, transactions: 67 },
  { hour: '11 AM', revenue: 78500, transactions: 112 },
  { hour: '12 PM', revenue: 105300, transactions: 156 },
  { hour: '1 PM', revenue: 128600, transactions: 189 },
  { hour: '2 PM', revenue: 185400, transactions: 245 },
  { hour: '3 PM', revenue: 212800, transactions: 289 },
  { hour: '4 PM', revenue: 245800, transactions: 312 },
  { hour: '5 PM', revenue: 238500, transactions: 298 },
  { hour: '6 PM', revenue: 195200, transactions: 245 },
  { hour: '7 PM', revenue: 142000, transactions: 178 },
  { hour: '8 PM', revenue: 89500, transactions: 112 },
];

/* ── payment method data ──────────────────────────────────────────────────── */
const paymentData = [
  { name: 'Cash', value: 55, color: '#10B981' },
  { name: 'M-Pesa', value: 25, color: '#3B82F6' },
  { name: 'Airtel Money', value: 12, color: '#F59E0B' },
  { name: 'Card', value: 8, color: '#8B5CF6' },
];

/* ── forms by board type ──────────────────────────────────────────────────── */
const boardData = [
  { board: 'CBSE', forms: 520, color: '#3B82F6' },
  { board: 'ICSE', forms: 310, color: '#8B5CF6' },
  { board: 'IB', forms: 180, color: '#F59E0B' },
  { board: 'State', forms: 238, color: '#10B981' },
];

/* ── school performance ranking (derived from mock data) ──────────────────── */
const schoolRanking = schools.map((s) => {
  const schoolApps = applications.filter((a) => a.schoolId === s.id && a.paymentStatus === 'completed');
  const revenue = schoolApps.reduce((sum, a) => sum + a.totalAmount, 0);
  const formsSold = schoolApps.length;
  const commission = Math.round(revenue * 0.1);
  const growth = Math.round((Math.random() * 20 + 3) * 10) / 10;
  return {
    name: s.name,
    board: s.boardType,
    formsSold,
    revenue,
    commission,
    growth,
  };
}).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

/* ── conversion metrics ───────────────────────────────────────────────────── */
const conversionMetrics = [
  { label: 'Form View \u2192 Cart Add', value: 68.4, trend: [45, 52, 48, 60, 65, 68] },
  { label: 'Cart \u2192 Checkout', value: 82.1, trend: [70, 72, 75, 78, 80, 82] },
  { label: 'Checkout \u2192 Payment', value: 91.3, trend: [85, 87, 88, 89, 90, 91] },
];

/* ── live transaction feed ────────────────────────────────────────────────── */
const TXN_METHODS = ['Cash', 'M-Pesa', 'Airtel Money', 'Card'];
const liveFeedData = transactions
  .filter((t) => t.type === 'form_sale' && t.status === 'completed')
  .slice(0, 15)
  .map((t) => ({
    id: t.id,
    school: t.description.split(' - ')[0]?.replace('Admission', '').trim() || 'School',
    amount: t.amount,
    method: TXN_METHODS[Math.floor(Math.random() * TXN_METHODS.length)],
    time: new Date(t.createdAt).toLocaleTimeString('en-US', { hour12: false }),
  }));

/* ── KPI data ─────────────────────────────────────────────────────────────── */
const kpiData = [
  { label: "Today's Revenue", value: 245800, prefix: 'TZS ', trend: 23, icon: DollarSign, color: 'text-admin-600', bg: 'bg-admin-50' },
  { label: 'Forms Sold Today', value: 312, prefix: '', trend: 18, icon: FileCheck, color: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Active Transactions', value: 47, prefix: '', trend: 12, icon: Activity, color: 'text-vendor-600', bg: 'bg-vendor-50', live: true },
  { label: 'Total Schools', value: schools.length, prefix: '', trend: 8, icon: Building2, color: 'text-school-600', bg: 'bg-school-50' },
  { label: 'Total Vendors', value: vendors.length, prefix: '', trend: 2, icon: Store, color: 'text-success-600', bg: 'bg-success-50' },
  { label: 'Parent Conversion', value: 78.5, prefix: '', suffix: '%', trend: 5, icon: UserCheck, color: 'text-warning-600', bg: 'bg-warning-50' },
];

/* ── animation helpers ────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ── components ───────────────────────────────────────────────────────────── */

const TrendBadge: FC<{ value: number }> = ({ value }) => {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : value === 0 ? Minus : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-success-600' : 'text-error-600'}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? '+' : ''}{value}%
    </span>
  );
};

const MedalIcon: FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">{rank}</span>;
};

const MiniSparkline: FC<{ data: number[]; color: string }> = ({ data, color }) => (
  <svg width="80" height="30" viewBox="0 0 80 30" className="mt-2">
    <defs>
      <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path
      d={`M0,${30 - (data[0] / 100) * 30} ${data.map((d, i) => `L${(i / (data.length - 1)) * 80},${30 - (d / 100) * 30}`).join(' ')} L80,30 L0,30 Z`}
      fill={`url(#spark-${color.replace('#', '')})`}
    />
    <path
      d={`M0,${30 - (data[0] / 100) * 30} ${data.map((d, i) => `L${(i / (data.length - 1)) * 80},${30 - (d / 100) * 30}`).join(' ')}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
  </svg>
);

/* ── main page ────────────────────────────────────────────────────────────── */
const PlatformAnalyticsPage: FC = () => {
  const [activeTransactions, setActiveTransactions] = useState(47);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTransactions((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTZS = (n: number) => 'TZS ' + n.toLocaleString();

  return (
    <Layout zone="admin">
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Real-time revenue dashboard and performance insights</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
              <CircleDot className="h-3 w-3 text-success-500 animate-pulse-dot" />
              <span className="text-sm font-medium text-gray-700">Live</span>
            </div>
          </div>

          {/* ── KPI Stat Cards ─────────────────────────────────────────── */}
          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {kpiData.map((kpi) => (
              <motion.div
                key={kpi.label}
                variants={fadeUp}
                className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg ${kpi.bg} p-2`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <TrendBadge value={kpi.trend} />
                </div>
                <div className="mt-3">
                  <p className="font-mono text-lg font-semibold text-gray-900">
                    {kpi.prefix}
                    {kpi.label === 'Active Transactions' ? activeTransactions :
                      kpi.label === 'Parent Conversion' ? kpi.value :
                        kpi.value.toLocaleString()}
                    {kpi.suffix || ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                </div>
                {kpi.live && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse-dot" />
                    <span className="text-[10px] text-success-600 font-medium">Real-time</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* ── Revenue Chart + Live Feed ─────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                <div className="flex items-center gap-2">
                  {['Today', '7 Days', '30 Days'].map((range) => (
                    <button
                      key={range}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${range === 'Today' ? 'bg-admin-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={hourlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `TZS ${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatTZS(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Live Transaction Feed */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <CircleDot className="h-4 w-4 text-success-500 animate-pulse-dot" />
                <h2 className="text-base font-semibold text-gray-900">Live Transactions</h2>
                <span className="text-xs text-success-600 font-medium ml-auto">{liveFeedData.length} recent</span>
              </div>
              <div className="space-y-0 max-h-[380px] overflow-y-auto pr-1">
                {liveFeedData.map((txn, i) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-success-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-mono">{txn.time}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">Form purchased at {txn.school}</p>
                      <p className="text-xs text-gray-500">via {txn.method}</p>
                    </div>
                    <span className="text-sm font-semibold text-admin-600 font-mono whitespace-nowrap">TZS {txn.amount.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Secondary Charts Row ───────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Payment Method Donut */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Method Distribution</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3">
                  {paymentData.map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-gray-600">{p.name}</span>
                      <span className="text-sm font-semibold text-gray-900 ml-2">{p.value}%</span>
                    </div>
                  ))}
                  <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-center">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="font-mono text-lg font-bold text-gray-900">TZS 2.4M</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Forms by Board Type */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">Forms by Board Type</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={boardData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="board" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="forms" radius={[6, 6, 0, 0]}>
                    {boardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── School Performance Ranking ─────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.7 }}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Schools by Revenue</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rank</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">School</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Board</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Forms Sold</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Revenue</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Commission</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolRanking.map((s, i) => (
                    <motion.tr
                      key={s.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3">
                        {i < 3 ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + i * 0.1, type: 'spring', stiffness: 200 }}>
                            <MedalIcon rank={i + 1} />
                          </motion.div>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-info-50 px-2 py-0.5 text-xs font-medium text-info-500">{s.board}</span>
                      </td>
                      <td className="py-3 text-right font-mono text-sm font-semibold text-gray-700">{s.formsSold}</td>
                      <td className="py-3 text-right font-mono text-sm font-semibold text-admin-600">{formatTZS(s.revenue)}</td>
                      <td className="py-3 text-right font-mono text-sm text-success-600">{formatTZS(s.commission)}</td>
                      <td className="py-3 text-right">
                        <TrendBadge value={s.growth} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Conversion Metrics ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {conversionMetrics.map((m, idx) => (
              <motion.div
                key={m.label}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-gray-900">{m.value}%</p>
                <MiniSparkline data={m.trend} color={idx === 0 ? '#3B82F6' : idx === 1 ? '#10B981' : '#8B5CF6'} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlatformAnalyticsPage;
