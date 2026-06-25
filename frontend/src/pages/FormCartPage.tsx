import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Flame,
  ChevronDown,
  ChevronUp,
  Store,
  CheckCircle,
  ShoppingCart,
  Building,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/lib/currency';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { cartService, ApiError, type CartResponse, type CartItem } from '@/lib/api';

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

/* ── Empty state ───────────────────────────────────────────────────────────── */

function EmptyCart() {
  return (
    <Layout zone="parent">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
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

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function FormCartPage() {
  const navigate = useNavigate();
  const fetchCart = useCallback(() => cartService.get(), []);
  const { data, loading, error, refetch } = useApi<CartResponse>(fetchCart, []);

  const [items, setItems] = useState<CartItem[] | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Prefer the locally-mutated list once the user removes items.
  const cartItems = items ?? data?.items ?? [];

  const removeItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const updated = await cartService.remove(itemId);
      setItems(updated.items);
    } catch {
      /* leave the item in place on failure */
    } finally {
      setRemovingId(null);
    }
  };

  const clearAll = async () => {
    const current = [...cartItems];
    setItems([]);
    try {
      await Promise.all(current.map((i) => cartService.remove(i.id)));
    } catch {
      refetch();
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckingOut(true);
    try {
      await cartService.checkout();
      navigate('/parent/dashboard');
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <Layout zone="parent">
        <LoadingState label="Loading your cart…" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout zone="parent">
        <ErrorState message={error} onRetry={refetch} />
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.pricing.basePrice * i.quantity, 0);
  const totalSurge = cartItems.reduce((s, i) => s + i.pricing.surgeAmount * i.quantity, 0);
  const bulkDiscount = cartItems.reduce((s, i) => s + i.pricing.bulkDiscountAmount, 0);
  const tax = cartItems.reduce((s, i) => s + i.pricing.taxAmount, 0);
  const total = cartItems.reduce((s, i) => s + i.pricing.finalPrice, 0);

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <motion.div className="mb-6 flex items-center justify-between" {...fadeUp(0)}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Form Cart</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalItems} form{totalItems !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button onClick={clearAll} className="text-xs font-medium text-error-500 hover:underline">
            Clear All
          </button>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item) => {
              const isExpanded = expandedItem === item.id;
              const isRemoving = removingId === item.id;
              const surgePercent = Math.round((item.pricing.surgeMultiplier - 1) * 100);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card"
                >
                  <div className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Building className="h-8 w-8 text-gray-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{item.schoolName}</h3>
                          <p className="text-xs text-gray-500">{item.formName}</p>
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isRemoving}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {surgePercent > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-urgent-500">
                            <Flame className="h-3.5 w-3.5 animate-pulse" />
                            High demand +{surgePercent}%
                          </span>
                        ) : (
                          <span />
                        )}
                        <div className="text-right">
                          {item.pricing.surgeAmount > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(item.pricing.basePrice * item.quantity)}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-parent-700">{formatCurrency(item.pricing.finalPrice)}</p>
                        </div>
                      </div>

                      {/* Price breakdown toggle */}
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
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
                              <span className="font-medium">{formatCurrency(item.pricing.basePrice)}</span>
                            </div>
                            {item.pricing.surgeAmount > 0 && (
                              <div className="flex justify-between text-urgent-500">
                                <span>Demand Surge ({surgePercent}%)</span>
                                <span className="font-medium">+ {formatCurrency(item.pricing.surgeAmount)}</span>
                              </div>
                            )}
                            {item.pricing.bulkDiscountAmount > 0 && (
                              <div className="flex justify-between text-success-600">
                                <span>Bulk Discount ({item.pricing.bulkDiscountPercent}%)</span>
                                <span className="font-medium">- {formatCurrency(item.pricing.bulkDiscountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity</span>
                              <span className="font-medium">x{item.quantity}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
                              <span>Net</span>
                              <span>{formatCurrency(item.pricing.finalPrice)}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <motion.div className="lg:w-80" {...fadeUp(0.2)}>
            <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-elevated">
              <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {totalSurge > 0 && (
                  <div className="flex justify-between text-sm text-urgent-500">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      Demand Surge
                    </span>
                    <span className="font-medium">+ {formatCurrency(totalSurge)}</span>
                  </div>
                )}

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-sm text-success-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Bulk Discount
                    </span>
                    <span className="font-medium">- {formatCurrency(bulkDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="my-4 h-px bg-gray-200" />

              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <motion.p
                  className="font-display text-2xl font-bold text-parent-700"
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(total)}
                </motion.p>
              </div>

              {bulkDiscount > 0 && (
                <motion.div
                  className="mt-3 flex items-center gap-1.5 rounded-xl bg-success-50 p-2.5 text-xs font-medium text-success-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CheckCircle className="h-4 w-4" />
                  You save {formatCurrency(bulkDiscount)} with bulk discount!
                </motion.div>
              )}

              {/* Payment Notice */}
              <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-warning-600" />
                  <span className="text-sm font-semibold text-warning-700">Cash Payment at Vendor</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  You&apos;ll be assigned a nearby verified vendor and pay in cash. No online payment required.
                </p>
              </div>

              {checkoutError && (
                <p className="mt-3 text-center text-xs font-medium text-error-500">{checkoutError}</p>
              )}

              {/* Checkout CTA */}
              <motion.button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-parent-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Store className="h-4 w-4" />
                {checkingOut ? 'Submitting…' : 'Proceed to Vendor for Cash Payment'}
                {!checkingOut && <ChevronRight className="h-4 w-4" />}
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
