import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, UserCheck, Coins, BarChart3, Search, Plus, X, Edit3, Eye,
  KeyRound, Save, ArrowUpCircle, ArrowDownCircle,
  Check, Download, Wallet, Receipt, Award,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { vendors as mockVendors, transactions } from '@/lib/mockData';
import type { Vendor } from '@/types';

/* ── helpers ────────────────────────────────────────────────────────────────── */
const formatTZS = (n: number) => 'TZS ' + n.toLocaleString();

const statusBadge = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success-50 text-success-600';
    case 'inactive': return 'bg-gray-100 text-gray-500';
    case 'suspended': return 'bg-error-50 text-error-600';
    case 'pending': return 'bg-warning-50 text-warning-600';
    default: return 'bg-gray-100 text-gray-500';
  }
};

const scoreColor = (score: number) => {
  if (score >= 4.5) return 'bg-success-500';
  if (score >= 3.5) return 'bg-brand-500';
  if (score >= 2.5) return 'bg-warning-500';
  return 'bg-error-500';
};

const scoreWidth = (score: number) => `${(score / 5) * 100}%`;

/* ── animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const } }),
};

/* ── token history mock ─────────────────────────────────────────────────────── */
interface TokenEntry {
  date: string;
  type: 'Add' | 'Deduct';
  amount: number;
  reason: string;
}

const generateTokenHistory = (_vendor: Vendor): TokenEntry[] => [
  { date: 'Feb 25', type: 'Deduct', amount: 15, reason: 'Payment processing' },
  { date: 'Feb 24', type: 'Add', amount: 500, reason: 'Weekly allocation' },
  { date: 'Feb 22', type: 'Deduct', amount: 12, reason: 'Payment processing' },
  { date: 'Feb 20', type: 'Add', amount: 1000, reason: 'New vendor bonus' },
  { date: 'Feb 18', type: 'Deduct', amount: 8, reason: 'Payment processing' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Platform Vendors Page
   ═══════════════════════════════════════════════════════════════════════════════ */
const PlatformVendorsPage: FC = () => {
  /* ── state ────────────────────────────────────────────────────────────────── */
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [tokenModalVendor, setTokenModalVendor] = useState<Vendor | null>(null);
  const [tokenTab, setTokenTab] = useState<'add' | 'deduct'>('add');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenReason, setTokenReason] = useState('');

  /* form state */
  const [form, setForm] = useState<Partial<Vendor>>({});

  /* ── derived stats ────────────────────────────────────────────────────────── */
  const activeVendors = vendors.filter((v) => v.status === 'active').length;
  const totalTokens = vendors.reduce((sum, v) => sum + v.tokenBalance, 0);
  const avgScore = vendors.length > 0 ? (vendors.reduce((sum, v) => sum + v.performanceScore, 0) / vendors.length).toFixed(1) : '0';

  /* ── filtered vendors ─────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.vendorId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || v.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [vendors, search, statusFilter]);

  /* ── vendor transaction data ──────────────────────────────────────────────── */
  const getVendorTransactions = (vendorId: string) =>
    transactions.filter((t) => t.vendorId === vendorId && t.type === 'form_sale' && t.status === 'completed');

  const getVendorStats = (vendor: Vendor) => {
    const txns = getVendorTransactions(vendor.id);
    const totalProcessed = txns.length;
    const totalRevenue = txns.reduce((sum, t) => sum + t.amount, 0);
    const commission = Math.round(totalRevenue * 0.1);
    return { totalProcessed, totalRevenue, commission };
  };

  /* ── form helpers ─────────────────────────────────────────────────────────── */
  const openAddDrawer = () => {
    setEditingVendor(null);
    setForm({ status: 'active', tokenBalance: 500 });
    setDrawerOpen(true);
  };

  const openEditDrawer = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setForm({ ...vendor });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    const newVendor: Vendor = {
      id: editingVendor?.id || `ven_${Date.now()}`,
      vendorId: editingVendor?.vendorId || `VEN${String(vendors.length + 1).padStart(3, '0')}`,
      name: form.name || '',
      email: form.email || '',
      phone: form.phone || '',
      status: (form.status as Vendor['status']) || 'active',
      tokenBalance: form.tokenBalance || 0,
      totalCollections: editingVendor?.totalCollections || 0,
      totalTicketsPrinted: editingVendor?.totalTicketsPrinted || 0,
      performanceScore: editingVendor?.performanceScore || 4.0,
      joinDate: editingVendor?.joinDate || new Date().toISOString().split('T')[0],
      location: form.location || '',
    };
    if (editingVendor) {
      setVendors((prev) => prev.map((v) => v.id === editingVendor.id ? newVendor : v));
    } else {
      setVendors((prev) => [...prev, newVendor]);
    }
    setDrawerOpen(false);
  };

  const handleTokenAction = () => {
    if (!tokenModalVendor || !tokenAmount) return;
    const amount = Number(tokenAmount);
    setVendors((prev) => prev.map((v) => {
      if (v.id !== tokenModalVendor.id) return v;
      return {
        ...v,
        tokenBalance: tokenTab === 'add' ? v.tokenBalance + amount : Math.max(0, v.tokenBalance - amount),
      };
    }));
    setTokenAmount('');
    setTokenReason('');
    setTokenModalVendor(null);
  };

  const handleProcessSettlement = (vendor: Vendor) => {
    alert(`Settlement processed for ${vendor.name}. Commission transferred.`);
  };

  /* ── render ───────────────────────────────────────────────────────────────── */
  return (
    <Layout zone="admin">
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Vendor Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage vendor accounts, tokens, and settlements</p>
            </div>
            <button
              onClick={openAddDrawer}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
            >
              <Plus className="h-4 w-4" /> Add Vendor
            </button>
          </div>

          {/* ── Stats Row ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Total Vendors', value: vendors.length, icon: Store, color: 'text-admin-600', bg: 'bg-admin-50' },
              { label: 'Active Vendors', value: activeVendors, icon: UserCheck, color: 'text-success-600', bg: 'bg-success-50' },
              { label: 'Tokens in Circulation', value: totalTokens.toLocaleString(), icon: Coins, color: 'text-vendor-600', bg: 'bg-vendor-50' },
              { label: 'Avg Performance', value: `${avgScore}/5`, icon: BarChart3, color: 'text-brand-600', bg: 'bg-brand-50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <div className={`inline-flex rounded-lg ${stat.bg} p-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="mt-3 font-mono text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Search & Filters ───────────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="sticky top-0 z-30 rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor name, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </motion.div>

          {/* ── Vendor List Table ──────────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-admin-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Tokens</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Collections</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vendor, i) => {
                    return (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-admin-600">{vendor.vendorId}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-vendor-100 flex items-center justify-center flex-shrink-0">
                              <Store className="h-3.5 w-3.5 text-vendor-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vendor.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{vendor.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(vendor.status)}`}>
                            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-vendor-600">{vendor.tokenBalance.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-gray-700">{formatTZS(vendor.totalCollections)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                              <div className={`h-full rounded-full ${scoreColor(vendor.performanceScore)}`} style={{ width: scoreWidth(vendor.performanceScore) }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{vendor.performanceScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditDrawer(vendor)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-colors" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDetailVendor(vendor)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-colors" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => setTokenModalVendor(vendor)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-vendor-600 transition-colors" title="Manage Tokens">
                              <Coins className="h-4 w-4" />
                            </button>
                            <button onClick={() => alert(`PIN reset for ${vendor.name}`)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-warning-600 transition-colors" title="Reset PIN">
                              <KeyRound className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-sm">No vendors match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ADD / EDIT VENDOR DRAWER
          ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[520px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                  </h2>
                  {editingVendor && <p className="text-xs font-mono text-admin-600">{editingVendor.vendorId}</p>}
                </div>
                <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                {/* Section 1: Basic */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Vendor Name *</label>
                      <input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="Vendor business name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Vendor ID</label>
                      <input value={form.vendorId || ''} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono outline-none" placeholder="Auto-generated" readOnly={!!editingVendor} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Email *</label>
                      <input type="email" value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="vendor@email.com" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                      <input value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="+255..." />
                    </div>
                  </div>
                </div>

                {/* Section 2: Location */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</h3>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">City / Location</label>
                    <input value={form.location || ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="City name" />
                  </div>
                </div>

                {/* Section 3: Account */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Account Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Initial Token Balance</label>
                      <input type="number" value={form.tokenBalance || ''} onChange={(e) => setForm((f) => ({ ...f, tokenBalance: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
                      <select value={form.status || 'active'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Vendor['status'] }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 border-t border-gray-100 bg-white pt-4 space-y-2">
                  <button onClick={handleSave} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]">
                    <Save className="h-4 w-4" /> {editingVendor ? 'Save Changes' : 'Create Vendor'}
                  </button>
                  <button onClick={() => setDrawerOpen(false)} className="w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOKEN MANAGEMENT MODAL
          ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {tokenModalVendor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setTokenModalVendor(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Manage Tokens — {tokenModalVendor.name}</h2>
                  <button onClick={() => setTokenModalVendor(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Current balance */}
                  <div className="mb-6 text-center rounded-xl bg-vendor-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Current Balance</p>
                    <p className="font-mono text-3xl font-bold text-vendor-600">{tokenModalVendor.tokenBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">tokens</p>
                  </div>

                  {/* Add / Deduct toggle */}
                  <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setTokenTab('add')}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${tokenTab === 'add' ? 'bg-white text-success-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <ArrowUpCircle className="h-4 w-4" /> Add
                    </button>
                    <button
                      onClick={() => setTokenTab('deduct')}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${tokenTab === 'deduct' ? 'bg-white text-error-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <ArrowDownCircle className="h-4 w-4" /> Deduct
                    </button>
                  </div>

                  {/* Amount & Reason */}
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        placeholder="Enter token amount"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Reason</label>
                      <textarea
                        value={tokenReason}
                        onChange={(e) => setTokenReason(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
                        placeholder="Enter reason..."
                      />
                    </div>
                  </div>

                  {/* History */}
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent History</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {generateTokenHistory(tokenModalVendor).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            {entry.type === 'Add' ? <ArrowUpCircle className="h-3.5 w-3.5 text-success-500" /> : <ArrowDownCircle className="h-3.5 w-3.5 text-error-500" />}
                            <span className="text-xs text-gray-500">{entry.date}</span>
                            <span className="text-xs text-gray-600">{entry.reason}</span>
                          </div>
                          <span className={`text-xs font-semibold font-mono ${entry.type === 'Add' ? 'text-success-600' : 'text-error-600'}`}>
                            {entry.type === 'Add' ? '+' : '-'}{entry.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={handleTokenAction}
                    disabled={!tokenAmount}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${tokenTab === 'add' ? 'bg-success-500 hover:bg-success-600' : 'bg-error-500 hover:bg-error-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {tokenTab === 'add' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                    {tokenTab === 'add' ? 'Add Tokens' : 'Deduct Tokens'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════════
          VENDOR DETAIL VIEW
          ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailVendor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setDetailVendor(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[600px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-vendor-100 flex items-center justify-center">
                    <Store className="h-5 w-5 text-vendor-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{detailVendor.name}</h2>
                    <p className="text-xs font-mono text-admin-600">{detailVendor.vendorId} • {detailVendor.location}</p>
                  </div>
                </div>
                <button onClick={() => setDetailVendor(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[10px] text-gray-500 uppercase">Email</p>
                      <p className="text-sm text-gray-900">{detailVendor.email}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-mono text-gray-900">{detailVendor.phone}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[10px] text-gray-500 uppercase">Status</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(detailVendor.status)}`}>
                        {detailVendor.status}
                      </span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[10px] text-gray-500 uppercase">Joined</p>
                      <p className="text-sm text-gray-900">{detailVendor.joinDate}</p>
                    </div>
                  </div>
                </div>

                {/* Token Balance */}
                <div className="rounded-xl bg-vendor-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-vendor-600" />
                      <span className="text-sm font-medium text-gray-700">Token Balance</span>
                    </div>
                    <span className="font-mono text-xl font-bold text-vendor-600">{detailVendor.tokenBalance.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-vendor-500 transition-all"
                      style={{ width: `${Math.min(100, (detailVendor.tokenBalance / 3000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Performance Metrics</h3>
                  {(() => {
                    const stats = getVendorStats(detailVendor);
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-brand-50 p-3 text-center">
                          <Receipt className="h-4 w-4 mx-auto text-brand-600 mb-1" />
                          <p className="font-mono text-lg font-bold text-brand-600">{stats.totalProcessed}</p>
                          <p className="text-[10px] text-gray-500">Forms Processed</p>
                        </div>
                        <div className="rounded-lg bg-success-50 p-3 text-center">
                          <Coins className="h-4 w-4 mx-auto text-success-600 mb-1" />
                          <p className="font-mono text-lg font-bold text-success-600">{formatTZS(stats.commission)}</p>
                          <p className="text-[10px] text-gray-500">Commission</p>
                        </div>
                        <div className="rounded-lg bg-warning-50 p-3 text-center">
                          <Award className="h-4 w-4 mx-auto text-warning-600 mb-1" />
                          <p className="font-mono text-lg font-bold text-warning-600">{detailVendor.performanceScore}</p>
                          <p className="text-[10px] text-gray-500">Score / 5</p>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Performance Score</p>
                    <div className="flex items-center gap-3">
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full rounded-full ${scoreColor(detailVendor.performanceScore)}`} style={{ width: scoreWidth(detailVendor.performanceScore) }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{((detailVendor.performanceScore / 5) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Transaction History</h3>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Txn ID</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Description</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase text-right">Amount</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getVendorTransactions(detailVendor.id).slice(0, 8).map((t) => (
                            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              <td className="px-3 py-2 font-mono text-[10px] text-admin-600">{t.transactionId}</td>
                              <td className="px-3 py-2 text-xs text-gray-700 max-w-[160px] truncate">{t.description}</td>
                              <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-gray-900">{formatTZS(t.amount)}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-medium text-success-600">{t.status}</span>
                              </td>
                            </tr>
                          ))}
                          {getVendorTransactions(detailVendor.id).length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-500">No transactions yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Settlement Calculator */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Settlement Calculation</h3>
                  {(() => {
                    const stats = getVendorStats(detailVendor);
                    const platformFee = Math.round(stats.totalRevenue * 0.1);
                    const netSettlement = stats.commission - platformFee;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Forms Processed</span>
                          <span className="font-mono font-semibold">{stats.totalProcessed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Revenue</span>
                          <span className="font-mono font-semibold">{formatTZS(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Commission Earned (10%)</span>
                          <span className="font-mono font-semibold text-success-600">{formatTZS(stats.commission)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Platform Fee</span>
                          <span className="font-mono font-semibold text-error-600">-{formatTZS(platformFee)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                          <span className="font-semibold text-gray-900">Net Settlement</span>
                          <span className="font-mono font-bold text-brand-600">{formatTZS(Math.max(0, netSettlement))}</span>
                        </div>
                        <button
                          onClick={() => handleProcessSettlement(detailVendor)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 py-2.5 text-sm font-medium text-white hover:bg-success-600 transition-colors"
                        >
                          <Check className="h-4 w-4" /> Process Settlement
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default PlatformVendorsPage;
