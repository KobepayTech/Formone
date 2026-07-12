import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  CheckCircle2,
  ArrowRight,
  Printer,
  Users,
  Building2,
  ToggleLeft,
  ToggleRight,
  Clock,
  CircleDot,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { formatCurrency } from '@/lib/currency';
import { LoadingState, ErrorState } from '@/components/DataStates';
import { useApi } from '@/hooks/useApi';
import { vendorService, ApiError, type VendorQueueItem } from '@/lib/api';

/** Flat token cost per confirmed payment (matches the backend). */
const TOKEN_COST = 10;

/* ── Types ── */
interface QueueItem {
  id: string;
  submissionId: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentId: string;
  schools: { name: string; price: number }[];
  totalAmount: number;
  tokenCost: number;
  status: 'Waiting' | 'Processing' | 'Completed';
  time: string;
}

interface CompletedTxn {
  id: string;
  parentName: string;
  amount: number;
  change: number;
  time: string;
}

const toQueueItem = (app: VendorQueueItem): QueueItem => ({
  id: app.id,
  submissionId: app.submissionId,
  parentName: app.studentProfile.parentName,
  parentPhone: app.studentProfile.parentPhone,
  studentName: `${app.studentProfile.firstName} ${app.studentProfile.lastName}`,
  studentId: app.studentProfile.universalStudentId,
  schools: [{ name: app.school.name, price: app.totalAmount }],
  totalAmount: app.totalAmount,
  tokenCost: TOKEN_COST,
  status: 'Waiting',
  time: new Date(app.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
});

/* ── Receipt Component ── */
const ReceiptCard: FC<{
  item: QueueItem;
  tendered: number;
  change: number;
  onPrint: () => void;
  onNext: () => void;
}> = ({ item, tendered, change, onPrint, onNext }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
  >
    {/* Receipt header */}
    <div className="mb-4 flex items-center justify-between border-b border-dashed border-gray-200 pb-3">
      <div>
        <h3 className="font-display text-lg font-bold text-gray-900">EduResult Pro</h3>
        <p className="text-xs text-gray-500">Payment Receipt</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xs text-gray-500">RCP-{Date.now().toString().slice(-8)}</p>
        <p className="font-mono text-xs text-gray-400">{new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>

    {/* Receipt content */}
    <div className="space-y-2 border-b border-dashed border-gray-200 pb-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Vendor</span>
        <span className="font-medium text-gray-900">Sharma Book Store (VEN001)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Parent</span>
        <span className="font-medium text-gray-900">{item.parentName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Student</span>
        <span className="font-mono text-xs text-gray-700">{item.studentName} ({item.studentId})</span>
      </div>
    </div>

    {/* Schools */}
    <div className="border-b border-dashed border-gray-200 py-3">
      <p className="mb-2 text-xs font-medium text-gray-500 uppercase">Schools</p>
      {item.schools.map((s, i) => (
        <div key={i} className="flex justify-between py-0.5 text-sm">
          <span className="text-gray-700">{s.name}</span>
          <span className="font-mono text-gray-900">{formatCurrency(s.price)}</span>
        </div>
      ))}
    </div>

    {/* Totals */}
    <div className="space-y-1 border-b border-dashed border-gray-200 py-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Total Paid</span>
        <span className="font-display text-lg font-bold text-vendor-700">{formatCurrency(item.totalAmount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Cash Tendered</span>
        <span className="font-mono text-gray-700">{formatCurrency(tendered)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Change</span>
        <span className="font-mono text-emerald-600">{formatCurrency(change)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Token Deducted</span>
        <span>-{item.tokenCost} tokens</span>
      </div>
    </div>

    {/* Footer */}
    <div className="pt-3 text-center">
      <p className="text-xs text-gray-400">Thank you for using EduResult Pro!</p>
    </div>

    {/* Actions */}
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        onClick={onPrint}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white
          px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Printer className="h-4 w-4" />
        Print Receipt
      </button>
      <button
        onClick={onPrint}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-vendor-500 px-4 py-2.5
          text-sm font-medium text-white transition-colors hover:bg-vendor-600"
      >
        <Printer className="h-4 w-4" />
        Print Tickets
      </button>
    </div>
    <button
      onClick={onNext}
      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5
        text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
    >
      Next Customer
      <ArrowRight className="h-4 w-4" />
    </button>
  </motion.div>
);

/* ── Main Page Component ── */
const VendorPaymentTerminalPage: FC = () => {
  const fetchQueue = useCallback(() => vendorService.queue(), []);
  const { data: queueData, loading, error, refetch } = useApi<VendorQueueItem[]>(fetchQueue, []);
  const { data: dashboard } = useApi(useCallback(() => vendorService.dashboard(), []), []);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [cashTendered, setCashTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [completedTxns, setCompletedTxns] = useState<CompletedTxn[]>([]);
  const [confirmError, setConfirmError] = useState('');

  // Seed the working queue and default selection once data arrives.
  useEffect(() => {
    if (queueData) {
      const mapped = queueData.map(toQueueItem);
      setQueue(mapped);
      setSelectedId((prev) => prev || mapped[0]?.id || '');
    }
  }, [queueData]);

  useEffect(() => {
    if (dashboard) setTokenBalance(dashboard.tokenBalance);
  }, [dashboard]);

  const selectedItem = queue.find((q) => q.id === selectedId) || queue[0];

  const handleSelect = (id: string) => {
    if (batchMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedId(id);
      setShowSuccess(false);
      setCashTendered('');
      setConfirmError('');
    }
  };

  const tenderedNum = parseInt(cashTendered, 10) || 0;
  const totalAmount = batchMode
    ? queue.filter((q) => selectedIds.has(q.id)).reduce((s, q) => s + q.totalAmount, 0)
    : selectedItem?.totalAmount || 0;
  const change = Math.max(0, tenderedNum - totalAmount);
  const isExact = tenderedNum >= totalAmount && totalAmount > 0;

  const appendCompleted = (item: QueueItem, itemChange: number) => {
    setCompletedTxns((prev) => [
      {
        id: `${item.id}-${prev.length}`,
        parentName: item.parentName,
        amount: item.totalAmount,
        change: itemChange,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 4),
    ]);
  };

  const handleConfirm = async () => {
    if (!isExact) return;
    setConfirmError('');
    setIsProcessing(true);
    try {
      if (batchMode) {
        const targets = queue.filter((q) => selectedIds.has(q.id));
        for (const t of targets) {
          const res = await vendorService.confirmPayment({
            applicationId: t.id,
            amountTendered: t.totalAmount,
            paymentMethod: 'cash',
          });
          appendCompleted(t, res.change);
        }
        setTokenBalance((b) => Math.max(0, b - targets.length * TOKEN_COST));
        setQueue((prev) => prev.filter((q) => !selectedIds.has(q.id)));
        setSelectedIds(new Set());
        setShowSuccess(true);
      } else if (selectedItem) {
        const res = await vendorService.confirmPayment({
          applicationId: selectedItem.id,
          amountTendered: tenderedNum,
          paymentMethod: 'cash',
        });
        setTokenBalance((b) => Math.max(0, b - TOKEN_COST));
        appendCompleted(selectedItem, res.change);
        setShowSuccess(true);
      }
    } catch (err) {
      setConfirmError(err instanceof ApiError ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    setShowSuccess(false);
    setCashTendered('');
    // Remove completed item and select next
    if (selectedItem) {
      setQueue((prev) => {
        const next = prev.filter((p) => p.id !== selectedItem.id);
        setSelectedId(next[0]?.id || '');
        return next;
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const setQuickAmount = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const pendingCount = queue.filter((q) => q.status === 'Waiting').length;

  if (loading) {
    return (
      <Layout zone="vendor">
        <LoadingState label="Loading payment queue…" />
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
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-xl font-bold text-gray-900">Payment Terminal</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-vendor-50 px-2.5 py-0.5 text-xs font-medium text-vendor-700">
                <CircleDot className="h-3 w-3" />
                {tokenBalance.toLocaleString('en-IN')} tokens
              </span>
            </div>
            {/* Batch mode toggle */}
            <button
              onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()); setShowSuccess(false); }}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5
                text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {batchMode ? <ToggleRight className="h-5 w-5 text-vendor-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
              Batch Mode
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-0 lg:flex-row">
          {/* ── Left Panel: Submission Queue ── */}
          <div className="w-full border-r border-gray-200 bg-white lg:w-[380px] lg:min-h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">Active Queue</h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {pendingCount} pending
                </span>
              </div>
              <button
                onClick={refetch}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 overflow-auto max-h-[600px]">
              {queue.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  role="button"
                  tabIndex={0}
                  aria-pressed={batchMode ? selectedIds.has(item.id) : selectedId === item.id}
                  onClick={() => handleSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(item.id);
                    }
                  }}
                  className={`cursor-pointer p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-vendor-400
                    ${selectedId === item.id && !batchMode
                      ? 'border-l-4 border-l-vendor-500 bg-vendor-50'
                      : 'border-l-4 border-l-transparent hover:bg-gray-50'
                    }
                    ${batchMode && selectedIds.has(item.id) ? 'border-l-4 border-l-vendor-500 bg-vendor-50/50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.parentName}</p>
                      <p className="text-xs text-gray-400">{item.parentPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base font-bold text-vendor-700">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      <Building2 className="h-3 w-3" />
                      {item.schools.length} school{item.schools.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">-{item.tokenCost} tokens</span>
                    <span className="ml-auto font-mono text-xs text-gray-400">{item.time}</span>
                  </div>
                  {batchMode && (
                    <div className="mt-2">
                      <div className={`flex h-4 w-4 items-center justify-center rounded border ${selectedIds.has(item.id) ? 'border-vendor-500 bg-vendor-500' : 'border-gray-300'}`}>
                        {selectedIds.has(item.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {queue.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No pending submissions
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel: Payment Terminal ── */}
          <div className="flex-1 bg-gray-50 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {showSuccess && selectedItem ? (
                /* Success State */
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Success header */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="rounded-2xl bg-gradient-to-b from-vendor-500 to-vendor-600 p-8 text-center text-white"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
                    >
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="font-display text-2xl font-bold">Payment Confirmed!</h2>
                    <p className="mt-1 text-vendor-100">
                      {formatCurrency(selectedItem.totalAmount)} received from {selectedItem.parentName}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      {selectedItem.tokenCost} tokens deducted
                    </div>
                  </motion.div>

                  {/* Receipt */}
                  <ReceiptCard
                    item={selectedItem}
                    tendered={tenderedNum}
                    change={change}
                    onPrint={handlePrint}
                    onNext={handleNext}
                  />
                </motion.div>
              ) : (
                /* Payment Form */
                <motion.div
                  key="payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto max-w-2xl space-y-4"
                >
                  {selectedItem ? (
                    <>
                      {/* Selected submission details */}
                      <div className="rounded-xl border border-vendor-200 bg-vendor-50/50 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{selectedItem.parentName}</h3>
                            <p className="text-sm text-gray-500">{selectedItem.parentPhone}</p>
                            <p className="mt-1 text-sm text-gray-700">
                              <Users className="mr-1 inline h-4 w-4 text-gray-400" />
                              {selectedItem.studentName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs text-gray-400">{selectedItem.submissionId}</p>
                          </div>
                        </div>

                        {/* Schools list */}
                        <div className="mt-3 space-y-2 border-t border-vendor-100 pt-3">
                          {selectedItem.schools.map((school, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-gray-700">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                {school.name}
                              </span>
                              <span className="font-mono text-gray-900">{formatCurrency(school.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Amount Due */}
                      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <p className="text-sm font-medium text-gray-500">Total Amount Due</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-display text-4xl font-bold text-vendor-700">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Token Cost: -{selectedItem.tokenCost} tokens</span>
                          <span>Balance after: {Math.max(0, tokenBalance - selectedItem.tokenCost).toLocaleString('en-IN')} tokens</span>
                        </div>
                      </div>

                      {/* Cash Tendered */}
                      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Cash Received
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                            TSh
                          </span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            placeholder="0"
                            className="h-16 w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-16 pr-4
                              font-display text-3xl font-bold text-gray-900
                              transition-colors duration-150
                              focus:border-vendor-500 focus:outline-none focus:ring-2 focus:ring-vendor-200"
                          />
                        </div>

                        {/* Quick amount buttons */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => setQuickAmount(totalAmount)}
                            className="rounded-full bg-vendor-500 px-4 py-1.5 text-xs font-medium text-white
                              transition-colors hover:bg-vendor-600"
                          >
                            Exact: {totalAmount}
                          </button>
                          {[500, 1000, 2000].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setQuickAmount(amt)}
                              className="rounded-full border border-gray-300 bg-white px-4 py-1.5
                                text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              {amt}
                            </button>
                          ))}
                        </div>

                        {/* Change calculation */}
                        <AnimatePresence>
                          {isExact && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 overflow-hidden rounded-lg bg-emerald-50 p-4"
                            >
                              <p className="text-sm text-gray-500">Change to Return</p>
                              <p className="font-display text-3xl font-bold text-emerald-600">
                                {formatCurrency(change)}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {confirmError && (
                        <p className="text-center text-sm font-medium text-error-500">{confirmError}</p>
                      )}

                      {/* Confirm Button */}
                      <button
                        onClick={handleConfirm}
                        disabled={!isExact || isProcessing}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl
                          bg-vendor-500 text-lg font-semibold text-white
                          shadow-[0_4px_14px_rgba(16,185,129,0.3)]
                          transition-all duration-150
                          hover:bg-vendor-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]
                          active:scale-[0.98]
                          disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Banknote className="h-5 w-5" />
                            Confirm Payment Received
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
                      No pending submissions
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Transactions */}
            <div className="mx-auto mt-8 max-w-2xl">
              <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Recent Transactions
              </h3>
              <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {completedTxns.map((txn, i) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-700">{txn.parentName}</p>
                        <p className="font-mono text-xs text-gray-400">{txn.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {formatCurrency(txn.amount)}
                      </p>
                      {txn.change > 0 && (
                        <p className="text-xs text-emerald-600">Change: {formatCurrency(txn.change)}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorPaymentTerminalPage;
