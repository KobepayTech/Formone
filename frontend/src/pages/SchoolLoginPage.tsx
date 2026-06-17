import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  GraduationCap, Building2, BookOpen, User, Lock,
  Eye, EyeOff, ShieldCheck, ArrowLeft, X, CheckCircle, Loader2,
} from 'lucide-react';

const boardOptions = ['CBSE', 'ICSE', 'IB', 'State Board', 'Cambridge', 'Other'];
const stateOptions = ['Delhi','Maharashtra','Karnataka','Uttar Pradesh','West Bengal','Tamil Nadu','Telangana','Rajasthan','Gujarat','Other'];

const JoinNetworkModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState({ schoolName: '', boardType: '', principalName: '', contactEmail: '', contactPhone: '', city: '', state: '', address: '', seats: '', website: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onClose(); setForm({ schoolName: '', boardType: '', principalName: '', contactEmail: '', contactPhone: '', city: '', state: '', address: '', seats: '', website: '' }); }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25, ease: [0,0,0.2,1] }}>
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            {submitted ? (
              <motion.div className="flex flex-col items-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-sm text-gray-500 text-center">Our team will review and contact you within 48 hours.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Join EduResult Pro Network</h2>
                <p className="text-sm text-gray-500 mb-5">Expand your school&apos;s reach and get verified applicants.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label><input name="schoolName" value={form.schoolName} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="e.g. Delhi Public School" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Board Type</label><select name="boardType" value={form.boardType} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"><option value="">Select Board Type</option>{boardOptions.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Principal Name</label><input name="principalName" value={form.principalName} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="Full name" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label><input name="contactPhone" value={form.contactPhone} onChange={handleChange} type="tel" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="+91-XXXXX-XXXXX" /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label><input name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="admin@school.edu" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="City name" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">State</label><select name="state" value={form.state} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"><option value="">Select State</option>{stateOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Address</label><textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all resize-none" placeholder="School address..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Annual Seats</label><input name="seats" value={form.seats} onChange={handleChange} type="number" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="e.g. 200" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Website <span className="text-gray-400 font-normal">(optional)</span></label><input name="website" value={form.website} onChange={handleChange} type="url" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="https://school.edu" /></div>
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-violet-500 py-3 text-sm font-semibold text-white hover:bg-violet-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(139,92,246,0.3)]">Submit Application</button>
                  <p className="text-xs text-gray-400 text-center">Our team will review and contact you within 48 hours.</p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function SchoolLoginPage() {
  const navigate = useNavigate();
  const { loginSchool } = useAuth();
  const [schoolCode, setSchoolCode] = useState('');
  const [boardType, setBoardType] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinOpen, setJoinOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginSchool(schoolCode.trim(), boardType, adminId.trim(), password);
      setLoading(false);
      navigate('/school/applicants');
    } catch (err) {
      setLoading(false);
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const fillDemo = () => {
    setSchoolCode('DAV-DL-001');
    setBoardType('CBSE');
    setAdminId('admin');
    setPassword('password');
    setError('');
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-violet-50 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8B5CF6" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl mx-4">
        <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center pr-12">
          <motion.div className="relative" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0,0,0.2,1] }}>
            <div className="w-48 h-48 rounded-full bg-violet-100 flex items-center justify-center mb-8">
              <GraduationCap className="h-24 w-24 text-violet-500" />
            </div>
            <motion.div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-violet-200/60 flex items-center justify-center" animate={{ y: [0,-8,0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <Building2 className="h-8 w-8 text-violet-600" />
            </motion.div>
            <motion.div className="absolute -bottom-2 -left-4 w-14 h-14 rounded-full bg-violet-200/50 flex items-center justify-center" animate={{ y: [0,8,0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}>
              <BookOpen className="h-7 w-7 text-violet-600" />
            </motion.div>
          </motion.div>
          <motion.div className="text-center mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">EduResult Pro</h2>
            <p className="text-gray-500 text-sm max-w-xs">Streamlined admissions, verified applicants, and seamless interview management for your school.</p>
          </motion.div>
        </div>

        <div className="w-full lg:w-[55%] flex justify-center">
          <motion.div className={`w-full max-w-[440px] rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden ${shake ? 'animate-shake' : ''}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0,0,0.2,1] }}>
            <div className="h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
            <div className="p-7 sm:p-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <span className="font-display text-base font-bold text-gray-900">EduResult Pro</span>
                <span className="rounded bg-blue-500 px-1 py-0.5 text-[10px] font-bold text-white">v2.0</span>
                <span className="text-[11px] font-bold tracking-widest text-violet-500 ml-1">SCHOOL PORTAL</span>
              </div>

              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-violet-500" />
                </div>
              </div>

              <h1 className="text-center text-2xl font-semibold text-gray-900 mb-1.5">School Staff Login</h1>
              <p className="text-center text-sm text-gray-500 mb-6">Access your school&apos;s applicant dashboard and interview management tools.</p>

              <AnimatePresence>
                {error && (
                  <motion.div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{error}</motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Code</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={schoolCode} onChange={e => setSchoolCode(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="e.g. DAV-DL-001" required />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Don&apos;t know your code? Contact platform admin.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Board Type</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select value={boardType} onChange={e => setBoardType(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none" required>
                      <option value="">Select Board Type</option>
                      {boardOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Staff ID / Email</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="staff@dps.edu or STF-001" required />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" placeholder="Enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-500 focus:ring-violet-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-violet-500 hover:text-violet-600 transition-colors">Forgot password?</button>
                </div>

                <motion.button type="submit" disabled={loading} className="w-full rounded-lg bg-violet-500 py-3 text-sm font-semibold text-white hover:bg-violet-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(139,92,246,0.3)] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Authenticating...</> : 'Login'}
                </motion.button>

                <button type="button" onClick={fillDemo} className="w-full text-center text-xs text-violet-500 hover:text-violet-600 transition-colors">Fill demo credentials</button>
              </form>

              <div className="my-6 flex items-center gap-3"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" /></div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">Not registered as a platform school? <button onClick={() => setJoinOpen(true)} className="text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors">Apply to Join Network</button></p>
                <button onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"><ArrowLeft className="h-3.5 w-3.5" />Back to main site</button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400"><ShieldCheck className="h-3.5 w-3.5" /><span>Secured with 256-bit encryption. All access is logged.</span></div>
            </div>
          </motion.div>
        </div>
      </div>

      <JoinNetworkModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
