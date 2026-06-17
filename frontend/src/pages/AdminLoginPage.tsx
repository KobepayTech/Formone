import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email.trim(), password);
      navigate('/admin/analytics');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-admin-50 via-gray-50 to-white px-4 py-8">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-elevated">
          <div className="h-1 w-full bg-gradient-to-r from-admin-400 via-admin-500 to-admin-600" />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-8 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-admin-50">
                  <ShieldCheck className="h-5 w-5 text-admin-600" />
                </div>
                <span className="text-xs font-bold tracking-[0.1em] text-admin-500 uppercase">
                  Platform Admin
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Admin Login</h1>
              <p className="mt-2 text-sm text-gray-500">Sign in to manage the EduResult Pro platform</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-center text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@eduresultpro.com"
                    required
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-admin-500 px-6 text-base font-semibold text-white shadow-[0_4px_14px_rgba(139,92,246,0.3)] transition-all hover:bg-admin-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Authenticating...</> : <><Lock className="h-4 w-4" />Login</>}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to main site
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
