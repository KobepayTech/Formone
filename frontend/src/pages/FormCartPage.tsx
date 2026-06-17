import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Flame,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Store,
  MapPin,
  Star,
  CheckCircle,
  ShoppingCart,
  Building,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router';
import Layout from '@/components/Layout';
import { schools, vendors, formCatalog } from '@/lib/mockData';
import { calculatePrice } from '@/lib/pricing';
import { formatCurrency } from '@/lib/currency';

/** Mock forms carry no per-form tax rate, so we apply a single default here.
 *  Real totals come from the backend (which uses each form's taxPercentage). */
const DEFAULT_TAX_PERCENT = 18;

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface CartItem {
  schoolId: string;
  schoolName: string;
  boardType: string;
  city: string;
  basePrice: number;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  quantity: number;
  formId: string;
}

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const slideIn = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30, transition: { duration: 0.25 } },
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function FormCartPage() {
  /* Seed cart with 3 schools from mock data */
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('form_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        schoolId: schools[0].id,
        schoolName: schools[0].name,
        boardType: schools[0].boardType,
        city: schools[0].city,
        basePrice: formCatalog[0].basePrice,
        demandLevel: schools[0].demandLevel,
        quantity: 1,
        formId: formCatalog[0].id,
      },
      {
        schoolId: schools[1].id,
        schoolName: schools[1].name,
        boardType: schools[1].boardType,
        city: schools[1].city,
        basePrice: formCatalog[1].basePrice,
        demandLevel: schools[1].demandLevel,
        quantity: 1,
        formId: formCatalog[1].id,
      },
      {
        schoolId: schools[2].id,
        schoolName: schools[2].name,
        boardType: schools[2].boardType,
        city: schools[2].city,
        basePrice: formCatalog[2].basePrice,
        demandLevel: schools[2].demandLevel,
        quantity: 1,
        formId: formCatalog[2].id,
      },
    ];
  });

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  /* Persist cart */
  useEffect(() => {
    localStorage.setItem('form_cart', JSON.stringify(cart));
  }, [cart]);

  const updateQty = (schoolId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.schoolId === schoolId
          ? { ...item, quantity: Math.max(1, Math.min(3, item.quantity + delta)) }
          : item
      )
    );
  };

  const removeItem = (schoolId: string) => {
    setRemovedIds((prev) => new Set(prev).add(schoolId));
    setTimeout(() => {
      setCart((prev) => prev.filter((i) => i.schoolId !== schoolId));
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(schoolId);
        return next;
      });
    }, 300);
  };

  /* Pricing calculations — mirrors the backend pricing service so the cart
     total matches what the server charges at checkout. */
  const pricing = useMemo(() => {
    const itemDetails = cart.map((item) => {
      const breakdown = calculatePrice(item.basePrice, item.demandLevel, DEFAULT_TAX_PERCENT, item.quantity);
      const surgePercent = Math.round((breakdown.surgeMultiplier - 1) * 100);
      return { ...item, ...breakdown, surgePercent, itemTotal: breakdown.finalPrice };
    });

    const subtotal = itemDetails.reduce((s, i) => s + i.basePrice * i.quantity, 0);
    const totalSurge = itemDetails.reduce((s, i) => s + i.surgeAmount * i.quantity, 0);
    const bulkDiscount = itemDetails.reduce((s, i) => s + i.bulkDiscountAmount, 0);
    const tax = itemDetails.reduce((s, i) => s + i.taxAmount, 0);
    const total = itemDetails.reduce((s, i) => s + i.finalPrice, 0);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    return { itemDetails, subtotal, totalSurge, bulkDiscount, tax, total, totalItems };
  }, [cart]);

  const activeVendors = vendors.filter((v) => v.status === 'active');

  if (cart.length === 0) {
    return (
      <Layout zone="parent">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
          >
            <ShoppingCart className="mx-auto h-20 w-20 text-gray-200" />
          </motion.div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Your Form Cart is Empty</h2>
          <p className="mt-2 text-sm text-gray-500">Browse schools and add application forms to get started.</p>
          <Link
            to="/parent/schools"
            className="mt-5 rounded-xl bg-parent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px"
          >
            Discover Schools
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <motion.div className="mb-6 flex items-center justify-between" {...fadeUp(0)}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Form Cart</h1>
            <p className="mt-1 text-sm text-gray-500">{pricing.totalItems} school{pricing.totalItems !== 1 ? 's' : ''} selected</p>
          </div>
          <button
            onClick={() => { setCart([]); localStorage.removeItem('form_cart'); }}
            className="text-xs font-medium text-error-500 hover:underline"
          >
            Clear All
          </button>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Cart Items */}
          <motion.div className="flex-1 space-y-3" variants={{ animate: { transition: { staggerChildren: 0.08 } } }} initial="initial" animate="animate">
            {pricing.itemDetails.map((item) => {
              const isExpanded = expandedItem === item.schoolId;
              const isRemoving = removedIds.has(item.schoolId);

              return (
                <motion.div
                  key={item.schoolId}
                  variants={slideIn}
                  className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-card transition-all ${
                    item.demandLevel === 'high' || item.demandLevel === 'critical'
                      ? 'border-l-[3px] border-l-urgent-500'
                      : item.demandLevel === 'medium'
                      ? 'border-l-[3px] border-l-warning-500'
                      : 'border-l-[3px] border-l-success-500'
                  } ${isRemoving ? 'opacity-0 translate-x-8' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* School Image Placeholder */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Building className="h-8 w-8 text-gray-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{item.schoolName}</h3>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {item.city}
                          </p>
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {item.boardType}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.schoolId)}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50">
                            <button
                              onClick={() => updateQty(item.schoolId, -1)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[20px] text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.schoolId, 1)}
                              disabled={item.quantity >= 3}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Demand indicator */}
                          {(item.demandLevel === 'high' || item.demandLevel === 'critical') && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-urgent-500">
                              <Flame className="h-3.5 w-3.5 animate-pulse" />
                              High demand +{item.surgePercent}%
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          {item.surgeAmount > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(item.basePrice * item.quantity)}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-parent-700">
                            {formatCurrency(item.itemTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Price breakdown toggle */}
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : item.schoolId)}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-parent-600 hover:underline"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? 'Hide' : 'Show'} breakdown
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            className="mt-2 space-y-1 rounded-xl bg-gray-50 p-3 text-xs"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base Price</span>
                              <span className="font-medium">{formatCurrency(item.basePrice)}</span>
                            </div>
                            {item.surgeAmount > 0 && (
                              <div className="flex justify-between text-urgent-500">
                                <span>Demand Surge ({item.surgePercent}%)</span>
                                <span className="font-medium">+ {formatCurrency(item.surgeAmount)}</span>
                              </div>
                            )}
                            {item.bulkDiscountAmount > 0 && (
                              <div className="flex justify-between text-success-600">
                                <span>Bulk Discount ({item.bulkDiscountPercent}%)</span>
                                <span className="font-medium">- {formatCurrency(item.bulkDiscountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity</span>
                              <span className="font-medium">x{item.quantity}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold">
                              <span>Net</span>
                              <span>{formatCurrency(item.itemTotal)}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Order Summary */}
          <motion.div className="lg:w-80" {...fadeUp(0.2)}>
            <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-elevated">
              <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
                </div>

                {pricing.totalSurge > 0 && (
                  <div className="flex justify-between text-sm text-urgent-500">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      Demand Surge
                    </span>
                    <span className="font-medium">+ {formatCurrency(pricing.totalSurge)}</span>
                  </div>
                )}

                {pricing.bulkDiscount > 0 && (
                  <div className="flex justify-between text-sm text-success-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Bulk Discount
                    </span>
                    <span className="font-medium">- {formatCurrency(pricing.bulkDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({DEFAULT_TAX_PERCENT}%)</span>
                  <span className="font-medium">{formatCurrency(pricing.tax)}</span>
                </div>
              </div>

              <div className="my-4 h-px bg-gray-200" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <motion.p
                    className="font-display text-2xl font-bold text-parent-700"
                    key={pricing.total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatCurrency(pricing.total)}
                  </motion.p>
                </div>
              </div>

              {/* Savings badge */}
              {pricing.bulkDiscount > 0 && (
                <motion.div
                  className="mt-3 flex items-center gap-1.5 rounded-xl bg-success-50 p-2.5 text-xs font-medium text-success-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CheckCircle className="h-4 w-4" />
                  You save {formatCurrency(pricing.bulkDiscount)} with bulk discount!
                </motion.div>
              )}

              {/* Payment Notice */}
              <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-warning-600" />
                  <span className="text-sm font-semibold text-warning-700">Cash Payment at Vendor</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  You will pay in cash at a verified vendor location. No online payment required.
                </p>
              </div>

              {/* Vendor Selection */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Select Nearest Vendor</label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                >
                  <option value="">Choose a vendor...</option>
                  {activeVendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location} — ★ {v.performanceScore}
                    </option>
                  ))}
                </select>

                {selectedVendor && (() => {
                  const v = activeVendors.find((ven) => ven.id === selectedVendor);
                  if (!v) return null;
                  return (
                    <motion.div
                      className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vendor-100 text-vendor-600">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {v.location} · <Star className="h-3 w-3 fill-warning-500 text-warning-500" /> {v.performanceScore}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>

              {/* Checkout CTA */}
              <motion.button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-parent-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px active:scale-[0.98]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Store className="h-4 w-4" />
                Proceed to Vendor for Cash Payment
                <ChevronRight className="h-4 w-4" />
              </motion.button>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Your tickets will be generated instantly after vendor confirmation
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
