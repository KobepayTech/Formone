import { useState, useRef, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  Store,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/* ── animation variants ── */
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -6, 6, 0],
    transition: { duration: 0.3 },
  },
};

/* ── PIN input component ── */
const PinInput: FC<{
  value: string;
  onChange: (pin: string) => void;
  error?: boolean;
}> = ({ value, onChange, error }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d?$/.test(digit)) return;
      const next = value.split('');
      next[index] = digit;
      const joined = next.join('').slice(0, 6);
      onChange(joined);
      if (digit && index < 5) {
        refs.current[index + 1]?.focus();
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [value]
  );

  return (
    <div className="flex items-center gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`h-12 w-12 rounded-lg border-2 text-center text-lg font-mono font-semibold
            transition-colors duration-150
            ${error
              ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200'
              : value[i]
                ? 'border-vendor-500 bg-vendor-50 text-vendor-700 focus:border-vendor-600 focus:ring-vendor-200'
                : 'border-gray-300 bg-white text-gray-900 focus:border-vendor-500 focus:ring-vendor-200'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-1
          `}
        />
      ))}
    </div>
  );
};

/* ── main page component ── */
const VendorLoginPage: FC = () => {
  const navigate = useNavigate();
  const { loginVendor } = useAuth();
  const [vendorId, setVendorId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!vendorId.trim()) {
      setError('Please enter your Vendor ID');
      return;
    }
    if (pin.length !== 6) {
      setError('Please enter a 6-digit PIN');
      return;
    }

    setIsLoading(true);

    try {
      await loginVendor(vendorId.trim().toUpperCase(), pin);
      setSuccess(true);
      setTimeout(() => navigate('/vendor/dashboard'), 800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVendorIdChange = (val: string) => {
    setVendorId(val.toUpperCase());
    setError('');
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-vendor-50 via-gray-50 to-white px-4 py-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-vendor-100 opacity-40" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-vendor-50 opacity-40" />
      </div>

      <motion.div
        className="relative w-full max-w-[420px]"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Login card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-elevated">
          {/* Green accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-vendor-400 via-vendor-500 to-vendor-600" />

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Header */}
            <motion.div
              className="mb-8 text-center"
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vendor-50">
                  <Store className="h-5 w-5 text-vendor-600" />
                </div>
                <span className="text-xs font-bold tracking-[0.1em] text-vendor-500 uppercase">
                  Vendor Portal
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                Vendor Login
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter your Vendor ID and PIN to access your dashboard
              </p>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-vendor-50 px-3 py-4 text-vendor-700"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Login successful! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <AnimatePresence mode="wait">
              {!success && (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Vendor ID */}
                  <motion.div
                    custom={1}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Vendor ID
                    </label>
                    <div className="relative">
                      <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <motion.input
                        type="text"
                        placeholder="VEN001"
                        value={vendorId}
                        onChange={(e) => handleVendorIdChange(e.target.value)}
                        className={`h-12 w-full rounded-lg border bg-white py-2 pl-10 pr-4
                          font-mono text-sm uppercase tracking-wide
                          transition-colors duration-150
                          focus:outline-none focus:ring-2 focus:ring-offset-1
                          ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-vendor-500 focus:ring-vendor-200'
                          }
                        `}
                        animate={error ? 'shake' : undefined}
                        variants={shakeVariants}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Format: VEN001</p>
                  </motion.div>

                  {/* PIN */}
                  <motion.div
                    custom={2}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      PIN
                    </label>
                    <PinInput
                      value={showPin ? pin : pin}
                      onChange={(val) => { setPin(val); setError(''); }}
                      error={!!error}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-gray-300 text-vendor-500 focus:ring-vendor-500"
                          checked={showPin}
                          onChange={(e) => setShowPin(e.target.checked)}
                        />
                        <span className="text-xs text-gray-500">Show PIN</span>
                      </label>
                    </div>
                  </motion.div>

                  {/* Login Button */}
                  <motion.div
                    custom={3}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg
                        bg-vendor-500 px-6 text-base font-semibold text-white
                        shadow-[0_4px_14px_rgba(16,185,129,0.3)]
                        transition-all duration-150
                        hover:bg-vendor-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]
                        active:scale-[0.98]
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    >
                      {isLoading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Login
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Forgot PIN */}
                  <motion.div
                    custom={4}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center"
                  >
                    <button
                      type="button"
                      onClick={() => alert('PIN reset: Contact platform admin')}
                      className="text-sm font-medium text-vendor-600 hover:text-vendor-700 transition-colors"
                    >
                      Forgot PIN?
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security notice */}
            <motion.div
              custom={5}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4"
            >
              <Shield className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">
                This portal is for authorized vendors only
              </span>
            </motion.div>
          </div>
        </div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center space-y-2"
        >
          <p className="text-xs text-gray-500">
            Need a vendor account?{' '}
            <button
              type="button"
              onClick={() => alert('Contact Platform Admin')}
              className="font-medium text-vendor-600 hover:text-vendor-700 transition-colors"
            >
              Contact Platform Admin
            </button>
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            Back to main site
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VendorLoginPage;
