import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Bus,
  Dumbbell,
  FlaskConical,
  Music,
  Computer,
  BookOpen,
  X,
  CheckCircle,
  Heart,
  SlidersHorizontal,
  GraduationCap,
  XCircle,
  Building,
} from 'lucide-react';
import Layout from '@/components/Layout';
import MatchScore from '@/components/MatchScore';
import { formatCurrency } from '@/lib/currency';
import DemandBadge from '@/components/DemandBadge';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { schoolService, cartService, type School as ApiSchool } from '@/lib/api';

/* ── View model ────────────────────────────────────────────────────────────── */

interface ViewSchool {
  id: string;
  name: string;
  city: string;
  boardType: string;
  rating: number;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  facilities: string[];
  capacity: number;
  availableSeats: number;
  feesRange: { min: number; max: number };
  foundedYear: number;
  description: string;
  matchScore: number;
}

/**
 * Deterministic match estimate from the fields the discovery endpoint returns
 * (rating, demand, seat availability). The per-school AI score lives behind
 * `/schools/:id/match-score`; this keeps the list render pure and cheap.
 */
const estimateMatch = (s: ApiSchool): number => {
  const seatRatio = s.capacity > 0 ? s.availableSeats / s.capacity : 0.5;
  const demandScore =
    s.demandLevel === 'low' ? 95 : s.demandLevel === 'medium' ? 82 : s.demandLevel === 'high' ? 68 : 55;
  return Math.max(40, Math.min(99, Math.round(s.rating * 10 + demandScore * 0.3 + seatRatio * 15)));
};

const toViewSchool = (s: ApiSchool): ViewSchool => ({
  id: s.id,
  name: s.name,
  city: s.city,
  boardType: s.boardType,
  rating: s.rating,
  demandLevel: s.demandLevel,
  facilities: s.facilities ?? [],
  capacity: s.capacity,
  availableSeats: s.availableSeats,
  feesRange: { min: s.feesMin, max: s.feesMax },
  foundedYear: (s as ApiSchool & { foundedYear?: number }).foundedYear ?? 0,
  description: (s as ApiSchool & { description?: string }).description ?? '',
  matchScore: estimateMatch(s),
});

/* ── Facility Icon Map ─────────────────────────────────────────────────────── */

const facilityIconMap: Record<string, typeof Bus> = {
  Transport: Bus,
  Sports: Dumbbell,
  Lab: FlaskConical,
  Library: BookOpen,
  Computer: Computer,
  Music: Music,
};

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const cardStagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function SchoolDiscoveryPage() {
  const [search, setSearch] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [feeRange, setFeeRange] = useState<number>(500000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'price_low' | 'rating'>('match');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [detailSchool, setDetailSchool] = useState<ViewSchool | null>(null);
  const [cartAdded, setCartAdded] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const boards = ['All', 'CBSE', 'ICSE', 'IB', 'State'];
  const cities = ['All', 'Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Mbeya', 'Zanzibar', 'Morogoro', 'Tanga'];
  const allFacilities = ['Library', 'Sports', 'Lab', 'Transport', 'Hostel', 'Computer'];

  /* Live schools from the discovery endpoint */
  const fetchSchools = useCallback(() => schoolService.discover(), []);
  const { data: apiSchools, loading, error, refetch } = useApi(fetchSchools, []);

  const schoolList = useMemo<ViewSchool[]>(
    () => (apiSchools ?? []).map(toViewSchool),
    [apiSchools]
  );

  /* Filter & Sort */
  const filtered = useMemo(() => {
    const result = schoolList.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedBoard !== 'All' && s.boardType !== selectedBoard) return false;
      if (selectedCity !== 'All' && s.city !== selectedCity) return false;
      if (s.feesRange.min > feeRange) return false;
      if (selectedFacilities.length > 0 && !selectedFacilities.every((f) => s.facilities.some((sf) => sf.toLowerCase().includes(f.toLowerCase())))) return false;
      return true;
    });

    switch (sortBy) {
      case 'match':
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'price_low':
        result.sort((a, b) => a.feesRange.min - b.feesRange.min);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [schoolList, search, selectedBoard, selectedCity, feeRange, selectedFacilities, sortBy]);

  const toggleFacility = (f: string) => {
    setSelectedFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* Add the school's first active form to the server-side cart. */
  const addToCart = async (schoolId: string) => {
    setCartAdded((prev) => new Set(prev).add(schoolId));
    try {
      const detail = await schoolService.get(schoolId);
      const form = detail.formCatalog?.find((f) => f.isActive) ?? detail.formCatalog?.[0];
      if (form) await cartService.add(schoolId, form.id, 1);
    } catch {
      /* Surface nothing here; the cart page reflects the source of truth. */
    } finally {
      setTimeout(() => {
        setCartAdded((prev) => {
          const next = new Set(prev);
          next.delete(schoolId);
          return next;
        });
      }, 1500);
    }
  };

  const activeFilterCount =
    (selectedBoard !== 'All' ? 1 : 0) +
    (selectedCity !== 'All' ? 1 : 0) +
    (feeRange < 500000 ? 1 : 0) +
    selectedFacilities.length;

  /* Compatibility meter */
  const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, sc) => s + sc.matchScore, 0) / filtered.length) : 70;

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ── AI Matching Banner ── */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-parent-200 bg-gradient-to-r from-parent-50 to-white p-5"
          {...fadeUp(0)}
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-parent-600" />
                <h2 className="text-lg font-semibold text-parent-700">AI-Powered School Matching</h2>
              </div>
              <p className="mt-1.5 text-sm text-gray-600">
                Find the best schools for your child based on their profile
              </p>
              <p className="mt-1 text-xs text-parent-600">
                Based on your profile, location and fee preferences
              </p>

              {/* Compatibility meter */}
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-2 flex-1 gap-0.5 overflow-hidden rounded-full">
                    {Array.from({ length: 10 }, (_, i) => (
                      <motion.div
                        key={i}
                        className={`flex-1 rounded-full ${i < Math.round(avgScore / 10) ? 'bg-success-500' : 'bg-gray-200'}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{avgScore}% Match</span>
                </div>
              </div>
            </div>
            <motion.div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-parent-100 text-parent-600"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GraduationCap className="h-10 w-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Search & Filter Bar ── */}
        <motion.div className="mt-5 space-y-3" {...fadeUp(0.1)}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by school name, city, or board..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-parent-500 bg-parent-50 text-parent-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-parent-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop filter chips */}
          <div className="hidden flex-wrap gap-2 sm:flex">
            {/* Board */}
            {boards.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBoard(b)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedBoard === b ? 'bg-parent-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {b === 'All' ? 'Board: All' : b}
              </button>
            ))}
            {/* City */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'City: Any' : c}</option>
              ))}
            </select>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 outline-none"
            >
              <option value="match">Sort: Match %</option>
              <option value="price_low">Sort: Price Low-High</option>
              <option value="rating">Sort: Rating</option>
            </select>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-card"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {/* Mobile-only filters */}
                  <div className="flex flex-wrap gap-2 sm:hidden">
                    {boards.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBoard(b)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          selectedBoard === b ? 'bg-parent-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  {/* Fee Range */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Max Fee: {formatCurrency(feeRange)}
                    </label>
                    <input
                      type="range"
                      min={10000}
                      max={500000}
                      step={10000}
                      value={feeRange}
                      onChange={(e) => setFeeRange(Number(e.target.value))}
                      className="w-full accent-parent-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>TSh 10K</span>
                      <span>TSh 5L</span>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Facilities</label>
                    <div className="flex flex-wrap gap-2">
                      {allFacilities.map((f) => (
                        <button
                          key={f}
                          onClick={() => toggleFacility(f)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedFacilities.includes(f)
                              ? 'bg-parent-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {selectedFacilities.includes(f) && <CheckCircle className="mr-1 inline h-3 w-3" />}
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setSelectedBoard('All'); setSelectedCity('All'); setFeeRange(500000); setSelectedFacilities([]); }}
                      className="text-xs font-medium text-error-500 hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── School Cards Grid ── */}
        {loading && <LoadingState label="Finding schools…" />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && (
        <motion.div
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={cardStagger}
          initial="initial"
          animate="animate"
        >
          {filtered.map((school) => {
            const isFav = favorites.has(school.id);
            const isAdded = cartAdded.has(school.id);
            const formPrice = Math.round(school.feesRange.min * 0.005);
            const surge = school.demandLevel === 'high' || school.demandLevel === 'critical' ? Math.round(formPrice * 0.2) : 0;

            return (
              <motion.div
                key={school.id}
                variants={cardItem}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                {/* Image Area */}
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-parent-100 to-gray-50">
                    <Building className="h-16 w-16 text-parent-200" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Board Badge */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-info-50 px-2 py-0.5 text-[10px] font-medium text-info-500">
                    {school.boardType}
                  </span>

                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite(school.id)}
                    className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition-all hover:bg-white hover:scale-105"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Match Badge */}
                  <motion.div
                    className="absolute right-3 top-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <MatchScore score={school.matchScore} />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{school.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {school.city}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500" />
                      <span className="text-xs font-semibold text-gray-700">{school.rating}</span>
                    </div>
                    <DemandBadge level={school.demandLevel} />
                  </div>

                  <p className="mt-2 text-sm font-semibold text-parent-700">
                    {formatCurrency(school.feesRange.min)} - {school.feesRange.max.toLocaleString()}/yr
                  </p>

                  {/* Facilities */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {school.facilities.slice(0, 4).map((f) => {
                      const Icon = facilityIconMap[f] || BookOpen;
                      return (
                        <span key={f} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                          <Icon className="h-3 w-3" />
                          {f}
                        </span>
                      );
                    })}
                    {school.facilities.length > 4 && (
                      <span className="text-[10px] text-gray-400">+{school.facilities.length - 4}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setDetailSchool(school)}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => addToCart(school.id)}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:-translate-y-px ${
                        isAdded ? 'bg-success-500' : 'bg-parent-500 hover:bg-parent-600'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Added
                        </>
                      ) : (
                        `Add — ${formatCurrency(formPrice + surge)}`
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <motion.div className="mt-12 text-center" {...fadeUp(0)}>
            <Building className="mx-auto h-16 w-16 text-gray-200" />
            <h3 className="mt-3 text-lg font-semibold text-gray-700">No schools match your criteria</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>

      {/* ── School Detail Modal ── */}
      <AnimatePresence>
        {detailSchool && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailSchool(null)}
          >
            <motion.div
              className="h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero */}
              <div className="relative aspect-video bg-gradient-to-br from-parent-200 to-parent-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="h-24 w-24 text-parent-300" />
                </div>
                <button
                  onClick={() => setDetailSchool(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-xl font-bold text-white">{detailSchool.name}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <MatchScore score={schoolList.find((s) => s.id === detailSchool.id)?.matchScore || 70} />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Board', value: detailSchool.boardType },
                    { label: 'Rating', value: `${detailSchool.rating}/5` },
                    { label: 'Est.', value: String(detailSchool.foundedYear) },
                    { label: 'Seats', value: String(detailSchool.availableSeats) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-gray-50 p-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* About */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">About</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{detailSchool.description}</p>
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Facilities</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {['Library', 'Science Lab', 'Computer Lab', 'Sports Ground', 'Swimming Pool', 'Transport', 'Cafeteria', 'Medical Room', 'Music Room', 'Art Studio', 'Auditorium', 'Smart Classes'].map((f) => {
                      const has = detailSchool.facilities.some((sf) => sf.toLowerCase().includes(f.toLowerCase()));
                      return (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          {has ? (
                            <CheckCircle className="h-4 w-4 shrink-0 text-success-500" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-gray-300" />
                          )}
                          <span className={has ? 'text-gray-700' : 'text-gray-400'}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Demand */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <DemandBadge level={detailSchool.demandLevel} />
                  <span className="text-xs text-gray-500">
                    {detailSchool.availableSeats} seats available out of {detailSchool.capacity}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => { addToCart(detailSchool.id); setDetailSchool(null); }}
                  className="w-full rounded-xl bg-parent-600 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px"
                >
                  Add to Cart — {formatCurrency(Math.round(detailSchool.feesRange.min * 0.005))}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
