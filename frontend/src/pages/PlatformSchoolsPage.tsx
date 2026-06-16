import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, FileCheck, Users, Percent, Search, Plus, X,
  Edit3, Eye, Download, Check,
  Library, Dumbbell, FlaskConical, Bus, Hotel, UtensilsCrossed,
  Mic, Save, TrendingUp,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { schools as mockSchools, formCatalog } from '@/lib/mockData';
import type { School, BoardType, DemandLevel } from '@/types';

/* ── facility options ───────────────────────────────────────────────────────── */
const FACILITY_OPTIONS = [
  { key: 'Library', icon: Library },
  { key: 'Sports', icon: Dumbbell },
  { key: 'Lab', icon: FlaskConical },
  { key: 'Transport', icon: Bus },
  { key: 'Hostel', icon: Hotel },
  { key: 'Cafeteria', icon: UtensilsCrossed },
  { key: 'Auditorium', icon: Mic },
];

const BOARD_TYPES: BoardType[] = ['CBSE', 'ICSE', 'IB', 'State', 'CBSE+IB'];
const DEMAND_LEVELS: DemandLevel[] = ['low', 'medium', 'high', 'critical'];

/* ── helpers ────────────────────────────────────────────────────────────────── */
const demandBadge = (level: DemandLevel) => {
  const map: Record<DemandLevel, string> = {
    low: 'bg-success-50 text-success-600',
    medium: 'bg-warning-50 text-warning-600',
    high: 'bg-urgent-50 text-urgent-500',
    critical: 'bg-error-50 text-error-600',
  };
  return map[level] || map.medium;
};

const statusBadge = (active: boolean) =>
  active ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500';

const formatTZS = (n: number) => 'TZS ' + n.toLocaleString();

/* ── animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const } }),
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Platform Schools Page
   ═══════════════════════════════════════════════════════════════════════════════ */
const PlatformSchoolsPage: FC = () => {
  /* ── state ────────────────────────────────────────────────────────────────── */
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<string>('All');
  const [demandFilter, setDemandFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [viewSchool, setViewSchool] = useState<School | null>(null);

  /* form state */
  const [form, setForm] = useState<Partial<School>>({});
  const [formFacilities, setFormFacilities] = useState<string[]>([]);
  const [formTypes, setFormTypes] = useState<string[]>(['admission']);

  /* ── derived stats ────────────────────────────────────────────────────────── */
  const activeSchools = schools.filter((s) => s.availableSeats > 0).length;
  const totalCapacity = schools.reduce((sum, s) => sum + s.capacity, 0);
  const totalSeats = schools.reduce((sum, s) => sum + s.availableSeats, 0);
  const fillRate = Math.round(((totalCapacity - totalSeats) / totalCapacity) * 100);

  /* ── filtered schools ─────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
      const matchBoard = boardFilter === 'All' || s.boardType === boardFilter;
      const matchDemand = demandFilter === 'All' || s.demandLevel === demandFilter;
      const matchStatus = statusFilter === 'All' || (statusFilter === 'Active' ? s.availableSeats > 0 : s.availableSeats <= 0);
      return matchSearch && matchBoard && matchDemand && matchStatus;
    });
  }, [schools, search, boardFilter, demandFilter, statusFilter]);

  /* ── form helpers ─────────────────────────────────────────────────────────── */
  const openAddDrawer = () => {
    setEditingSchool(null);
    setForm({
      boardType: 'CBSE', facilities: [], capacity: 500,
      availableSeats: 100, feesRange: { min: 10000, max: 50000 },
    });
    setFormFacilities([]);
    setFormTypes(['admission']);
    setDrawerOpen(true);
  };

  const openEditDrawer = (school: School) => {
    setEditingSchool(school);
    setForm({ ...school });
    setFormFacilities(school.facilities || []);
    setDrawerOpen(true);
  };

  const toggleFacility = (f: string) => {
    setFormFacilities((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const toggleFormType = (ft: string) => {
    setFormTypes((prev) => prev.includes(ft) ? prev.filter((x) => x !== ft) : [...prev, ft]);
  };

  const handleSave = () => {
    if (!form.name) return;
    const newSchool: School = {
      id: editingSchool?.id || `sch_${Date.now()}`,
      name: form.name || 'New School',
      code: form.code || `SCH-${Date.now()}`,
      boardType: (form.boardType as BoardType) || 'CBSE',
      address: form.address || '',
      city: form.city || '',
      state: form.state || '',
      phone: form.phone || '',
      email: form.email || '',
      website: form.website || '',
      feesRange: form.feesRange || { min: 10000, max: 50000 },
      facilities: formFacilities,
      capacity: form.capacity || 500,
      availableSeats: form.availableSeats || 100,
      description: form.description || '',
      logo: form.logo || '',
      rating: form.rating || 4.0,
      alumniCount: form.alumniCount || 0,
      foundedYear: form.foundedYear || 2000,
      demandLevel: (form.demandLevel as DemandLevel) || 'medium',
      image: form.image || '',
    };
    if (editingSchool) {
      setSchools((prev) => prev.map((s) => s.id === editingSchool.id ? newSchool : s));
    } else {
      setSchools((prev) => [...prev, newSchool]);
    }
    setDrawerOpen(false);
  };

  const toggleStatus = (school: School) => {
    setSchools((prev) => prev.map((s) => s.id === school.id ? { ...s, availableSeats: s.availableSeats > 0 ? 0 : Math.floor(s.capacity * 0.2) } : s));
  };

  /* ── render ───────────────────────────────────────────────────────────────── */
  return (
    <Layout zone="admin">
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">School Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage school catalog, form pricing, and interview settings</p>
            </div>
            <button
              onClick={openAddDrawer}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
            >
              <Plus className="h-4 w-4" /> Add School
            </button>
          </div>

          {/* ── Stats Row ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Total Schools', value: schools.length, icon: Building2, color: 'text-admin-600', bg: 'bg-admin-50' },
              { label: 'Active Schools', value: activeSchools, icon: FileCheck, color: 'text-success-600', bg: 'bg-success-50' },
              { label: 'Total Capacity', value: totalCapacity.toLocaleString(), icon: Users, color: 'text-brand-600', bg: 'bg-brand-50' },
              { label: 'Network Fill Rate', value: `${fillRate}%`, icon: Percent, color: 'text-warning-600', bg: 'bg-warning-50' },
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
                placeholder="Search school name, code, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="All">All Boards</option>
                {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select
                value={demandFilter}
                onChange={(e) => setDemandFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="All">All Demand</option>
                {DEMAND_LEVELS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </motion.div>

          {/* ── School Catalog Table ───────────────────────────────────── */}
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
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">School</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Board</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Fees (TZS)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Capacity</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Seats</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Demand</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((school, i) => (
                    <motion.tr
                      key={school.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-brand-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{school.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-admin-600">{school.code}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-info-50 px-2 py-0.5 text-xs font-medium text-info-500">{school.boardType}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{school.city}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-gray-700">
                        {formatTZS(school.feesRange.min)} - {formatTZS(school.feesRange.max)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-gray-700">{school.capacity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-gray-700">{school.availableSeats.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${demandBadge(school.demandLevel)}`}>
                          {school.demandLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(school)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${statusBadge(school.availableSeats > 0)}`}
                        >
                          {school.availableSeats > 0 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {school.availableSeats > 0 ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditDrawer(school)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewSchool(school)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-500 text-sm">No schools match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Demand Pricing Rules Section ───────────────────────────── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-warning-500" />
              <h2 className="text-lg font-semibold text-gray-900">Demand Pricing Rules</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Low Demand', threshold: '< 50% seats filled', discount: '10% Early Bird', color: 'border-success-300 bg-success-50', textColor: 'text-success-600', indicator: 'bg-success-500' },
                { label: 'Medium Demand', threshold: '50% - 80% seats filled', discount: '5% Standard', color: 'border-warning-300 bg-warning-50', textColor: 'text-warning-600', indicator: 'bg-warning-500' },
                { label: 'High Demand', threshold: '> 80% seats filled', discount: '+15% Surge', color: 'border-error-300 bg-error-50', textColor: 'text-error-600', indicator: 'bg-error-500' },
              ].map((rule) => (
                <div key={rule.label} className={`rounded-xl border p-4 ${rule.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${rule.indicator}`} />
                    <h3 className={`text-sm font-semibold ${rule.textColor}`}>{rule.label}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{rule.threshold}</p>
                  <p className="text-sm font-medium text-gray-900">{rule.discount}</p>
                  <div className="mt-3 rounded bg-white/60 px-3 py-2">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Adjustment %</label>
                    <input
                      type="number"
                      defaultValue={rule.label === 'Low Demand' ? -10 : rule.label === 'Medium Demand' ? 0 : 15}
                      className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm font-mono outline-none focus:border-brand-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Dynamic preview: At current network demand ({fillRate}%), average form price = <span className="font-semibold text-gray-900">{formatTZS(425)}</span> (Base {formatTZS(350)} + Surge {formatTZS(75)})</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ADD / EDIT SCHOOL DRAWER
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
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-[560px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingSchool ? 'Edit School' : 'Add New School'}
                  </h2>
                  {editingSchool && <p className="text-xs font-mono text-admin-600">{editingSchool.code}</p>}
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
                      <label className="mb-1 block text-xs font-medium text-gray-700">School Name *</label>
                      <input
                        value={form.name || ''}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        placeholder="Enter school name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">School Code</label>
                        <input
                          value={form.code || ''}
                          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                          placeholder="SCH-XXX"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Board Type</label>
                        <select
                          value={form.boardType || 'CBSE'}
                          onChange={(e) => setForm((f) => ({ ...f, boardType: e.target.value as BoardType }))}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        >
                          {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
                      <textarea
                        value={form.description || ''}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact & Location</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Address</label>
                      <input
                        value={form.address || ''}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">City</label>
                        <input value={form.city || ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="City" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">State</label>
                        <input value={form.state || ''} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="State" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                        <input value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="+255..." />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
                        <input value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="school@edu" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Website</label>
                      <input value={form.website || ''} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                {/* Section 3: Academic */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Academic Details</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Capacity</label>
                        <input type="number" value={form.capacity || ''} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Available Seats</label>
                        <input type="number" value={form.availableSeats || ''} onChange={(e) => setForm((f) => ({ ...f, availableSeats: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Fee Range (TZS)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" value={form.feesRange?.min || ''} onChange={(e) => setForm((f) => ({ ...f, feesRange: { min: Number(e.target.value), max: f.feesRange?.max ?? 50000 } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="Min" />
                        <input type="number" value={form.feesRange?.max || ''} onChange={(e) => setForm((f) => ({ ...f, feesRange: { min: f.feesRange?.min ?? 10000, max: Number(e.target.value) } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="Max" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Facilities */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Facilities</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FACILITY_OPTIONS.map((f) => (
                      <label key={f.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 transition-colors ${formFacilities.includes(f.key) ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={formFacilities.includes(f.key)} onChange={() => toggleFacility(f.key)} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400" />
                        <f.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">{f.key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section 5: Form Config */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Form Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Form Types Offered</label>
                      <div className="flex flex-wrap gap-2">
                        {['admission', 'transfer', 'scholarship'].map((ft) => (
                          <button
                            key={ft}
                            onClick={() => toggleFormType(ft)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${formTypes.includes(ft) ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {ft.charAt(0).toUpperCase() + ft.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Base Price per Form (TZS)</label>
                      <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="0" defaultValue={formCatalog[0]?.basePrice || 500} />
                    </div>
                  </div>
                </div>

                {/* Section 6: Status */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">Status</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" checked={(form.availableSeats || 0) > 0} onChange={() => setForm((f) => ({ ...f, availableSeats: f.availableSeats || 100 }))} className="h-4 w-4 text-brand-500" />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" checked={(form.availableSeats || 0) <= 0} onChange={() => setForm((f) => ({ ...f, availableSeats: 0 }))} className="h-4 w-4 text-brand-500" />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 border-t border-gray-100 bg-white pt-4 space-y-2">
                  <button onClick={handleSave} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]">
                    <Save className="h-4 w-4" /> {editingSchool ? 'Save Changes' : 'Save School'}
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
          VIEW SCHOOL MODAL
          ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewSchool && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setViewSchool(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">{viewSchool.name}</h2>
                  <button onClick={() => setViewSchool(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] text-gray-500 uppercase">Code</p><p className="font-mono text-sm font-medium">{viewSchool.code}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] text-gray-500 uppercase">Board</p><p className="text-sm font-medium">{viewSchool.boardType}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] text-gray-500 uppercase">City</p><p className="text-sm font-medium">{viewSchool.city}, {viewSchool.state}</p></div>
                    <div className="rounded-lg bg-gray-50 p-3"><p className="text-[10px] text-gray-500 uppercase">Founded</p><p className="text-sm font-medium">{viewSchool.foundedYear}</p></div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Contact</p>
                    <p className="text-sm">{viewSchool.phone}</p>
                    <p className="text-sm text-gray-500">{viewSchool.email}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-brand-50 p-3 text-center"><p className="text-lg font-bold text-brand-600">{viewSchool.capacity}</p><p className="text-[10px] text-gray-500">Capacity</p></div>
                    <div className="rounded-lg bg-success-50 p-3 text-center"><p className="text-lg font-bold text-success-600">{viewSchool.availableSeats}</p><p className="text-[10px] text-gray-500">Available</p></div>
                    <div className="rounded-lg bg-warning-50 p-3 text-center"><p className="text-lg font-bold text-warning-600">{viewSchool.rating}</p><p className="text-[10px] text-gray-500">Rating</p></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewSchool.facilities.map((f) => (
                        <span key={f} className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default PlatformSchoolsPage;
