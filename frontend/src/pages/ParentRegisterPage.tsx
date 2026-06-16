import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Search,
  ShoppingCart,
  Ticket,
  Store,
  User,
  Phone,
  Calendar,
  Droplet,
  MapPin,
  Mail,
  UserCircle,
  X,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface DocumentUpload {
  type: string;
  label: string;
  required: boolean;
  file: File | null;
  progress: number;
  verified: boolean;
  confidence: number;
}

/* ── Step Config ───────────────────────────────────────────────────────────── */

const steps = ['OTP Verification', 'Student Profile', 'Documents', 'QR Passport'];

const initialDocs: DocumentUpload[] = [
  { type: 'birth_certificate', label: 'Birth Certificate', required: true, file: null, progress: 0, verified: false, confidence: 0 },
  { type: 'marksheet', label: 'Previous Marksheet', required: true, file: null, progress: 0, verified: false, confidence: 0 },
  { type: 'transfer_letter', label: 'Transfer Letter', required: false, file: null, progress: 0, verified: false, confidence: 0 },
  { type: 'medical_record', label: 'Medical Record', required: false, file: null, progress: 0, verified: false, confidence: 0 },
];

/* ── Animations ────────────────────────────────────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

/* ── Confetti Component ────────────────────────────────────────────────────── */

const Confetti: FC = () => {
  const colors = ['#3B82F6', '#1D4ED8', '#10B981', '#8B5CF6', '#FFD700', '#F59E0B'];
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 40 : 800,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function ParentRegisterPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  /* Step 1: OTP */
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState(false);

  /* Step 2: Profile */
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    bloodGroup: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  /* Step 3: Documents */
  const [docs, setDocs] = useState<DocumentUpload[]>(initialDocs);
  const [dragOver, setDragOver] = useState<string | null>(null);

  /* Step 4: QR */
  const [showConfetti, setShowConfetti] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  /* ── Helpers ─────────────────────────────────────────────── */

  const goNext = () => {
    if (step < 3) {
      setDir(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  };

  const sendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const verifyOtp = useCallback(() => {
    const code = otp.join('');
    if (code.length === 6) {
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        if (code === '000000') {
          setOtpError(true);
          setTimeout(() => setOtpError(false), 600);
        } else {
          goNext();
        }
      }, 800);
    }
  }, [otp]);

  useEffect(() => {
    if (otpSent && otp.every((d) => d !== '')) {
      verifyOtp();
    }
  }, [otp, otpSent, verifyOtp]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const profileValid =
    profile.firstName &&
    profile.lastName &&
    profile.dateOfBirth &&
    profile.gender &&
    profile.bloodGroup &&
    profile.address &&
    profile.parentName &&
    profile.parentPhone;

  const requiredDocsUploaded = docs.filter((d) => d.required).every((d) => d.file !== null);

  const handleFileSelect = (docType: string, file: File) => {
    setDocs((prev) =>
      prev.map((d) => (d.type === docType ? { ...d, file, progress: 0, verified: false, confidence: 0 } : d))
    );
    // Simulate upload + AI verification
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDocs((prev) =>
        prev.map((d) => (d.type === docType ? { ...d, progress } : d))
      );
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDocs((prev) =>
            prev.map((d) =>
              d.type === docType
                ? { ...d, verified: true, confidence: Math.floor(Math.random() * 15) + 85 }
                : d
            )
          );
        }, 600);
      }
    }, 150);
  };

  const onDropFile = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(docType, file);
  };

  const studentName = `${profile.firstName || 'Student'} ${profile.lastName || ''}`.trim();
  const universalId = `ERP-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const qrData = JSON.stringify({
    universalStudentId: universalId,
    name: studentName,
    createdAt: new Date().toISOString(),
  });

  /* ── Step 4: trigger effects ─────────────────────────────── */
  useEffect(() => {
    if (step === 3) {
      const t1 = setTimeout(() => setQrReady(true), 1500);
      const t2 = setTimeout(() => setShowConfetti(true), 2000);
      const t3 = setTimeout(() => setShowConfetti(false), 5000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  /* ── Render Steps ────────────────────────────────────────── */

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-parent-50">
      {/* Simplified Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-parent-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold text-gray-900">Parent Registration</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-6">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((label, idx) => (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        idx <= step ? 'bg-parent-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <motion.div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                      idx < step
                        ? 'bg-parent-500 text-white'
                        : idx === step
                        ? 'bg-parent-500 text-white ring-4 ring-parent-100'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    initial={false}
                    animate={idx === step ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {idx < step ? <Check className="h-4 w-4" /> : idx + 1}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        idx < step ? 'bg-parent-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-2 hidden text-xs font-medium sm:block ${
                    idx <= step ? 'text-parent-700' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <motion.div
          className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8 ${
            otpError ? 'animate-[shake_0.3s_ease-in-out]' : ''
          }`}
          layout
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* ── Step 1: OTP ── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="font-display text-2xl font-bold text-gray-900">Let&apos;s Get Started</h2>
                    <p className="mt-2 text-sm text-gray-500">Enter your phone number to create your account</p>
                  </div>

                  {!otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                            <Phone className="mr-1 h-3.5 w-3.5" />
                                    +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98765 43210"
                            className="w-full rounded-r-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                          />
                        </div>
                      </div>
                      <button
                        onClick={sendOtp}
                        disabled={phone.length !== 10}
                        className="w-full rounded-xl bg-parent-600 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        Send OTP
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-center text-sm text-gray-600">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-medium text-gray-900">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                      </p>
                      <div className="flex justify-center gap-2">
                        {otp.map((d, i) => (
                          <motion.input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKey(i, e)}
                            className="h-12 w-12 rounded-xl border-2 border-gray-300 bg-white text-center text-xl font-bold text-gray-900 outline-none transition-colors focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={verifyOtp}
                        disabled={otp.some((d) => !d) || verifying}
                        className="w-full rounded-xl bg-parent-600 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {verifying ? 'Verifying...' : 'Verify & Continue'}
                      </button>
                      <p className="text-center text-xs text-gray-400">
                        Didn&apos;t receive?{' '}
                        <button onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }} className="text-parent-600 hover:underline">
                          Resend
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Student Profile ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="font-display text-2xl font-bold text-gray-900">Create Student Profile</h2>
                    <p className="mt-2 text-sm text-gray-500">This information will be used across all school applications</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        value={profile.firstName}
                        onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                        placeholder="First name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        value={profile.lastName}
                        onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                        placeholder="Last name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      <Calendar className="mr-1 inline h-3.5 w-3.5" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-3">
                      {(['male', 'female', 'other'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => setProfile((p) => ({ ...p, gender: g }))}
                          className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all ${
                            profile.gender === g
                              ? 'border-parent-500 bg-parent-500 text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      <Droplet className="mr-1 inline h-3.5 w-3.5" />
                      Blood Group
                    </label>
                    <select
                      value={profile.bloodGroup}
                      onChange={(e) => setProfile((p) => ({ ...p, bloodGroup: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200 bg-white"
                    >
                      <option value="">Select blood group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Other'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      <MapPin className="mr-1 inline h-3.5 w-3.5" />
                      Address
                    </label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Enter complete residential address"
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200 resize-none"
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Parent/Guardian Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          <UserCircle className="mr-1 inline h-3.5 w-3.5" />
                          Parent Name
                        </label>
                        <input
                          value={profile.parentName}
                          onChange={(e) => setProfile((p) => ({ ...p, parentName: e.target.value }))}
                          placeholder="Full name"
                          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            <Phone className="mr-1 inline h-3.5 w-3.5" />
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={profile.parentPhone}
                            onChange={(e) => setProfile((p) => ({ ...p, parentPhone: e.target.value }))}
                            placeholder="Parent phone"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            <Mail className="mr-1 inline h-3.5 w-3.5" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={profile.parentEmail}
                            onChange={(e) => setProfile((p) => ({ ...p, parentEmail: e.target.value }))}
                            placeholder="Parent email"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={goBack}
                      className="flex items-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!profileValid}
                      className="flex flex-1 items-center justify-center rounded-xl bg-parent-600 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Continue to Documents
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400">Step 2 of 4</p>
                </div>
              )}

              {/* ── Step 3: Documents ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="font-display text-2xl font-bold text-gray-900">Upload Documents</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload documents once, use them for all school applications
                    </p>
                  </div>

                  <div className="space-y-4">
                    {docs.map((doc, idx) => (
                      <motion.div
                        key={doc.type}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900">{doc.label}</h3>
                              {doc.required ? (
                                <span className="rounded-full bg-error-50 px-2 py-0.5 text-[10px] font-medium text-error-500">
                                  Required
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500">PDF, JPG, or PNG. Max 5MB.</p>

                            {doc.file ? (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-success-500" />
                                  <span className="truncate text-xs text-gray-700">{doc.file.name}</span>
                                  <span className="text-xs text-gray-400">({(doc.file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                  <button
                                    onClick={() =>
                                      setDocs((prev) =>
                                        prev.map((d) => (d.type === doc.type ? { ...d, file: null, progress: 0, verified: false } : d))
                                      )
                                    }
                                    className="ml-auto rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-error-500"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                {doc.progress < 100 ? (
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                    <motion.div
                                      className="h-full rounded-full bg-parent-500"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${doc.progress}%` }}
                                      transition={{ duration: 0.2 }}
                                    />
                                  </div>
                                ) : doc.verified ? (
                                  <div className="flex items-center gap-2 text-xs">
                                    <ShieldCheck className="h-3.5 w-3.5 text-success-500" />
                                    <span className="font-medium text-success-600">
                                      AI Verified ({doc.confidence}% confidence)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-warning-600">
                                    <motion.div
                                      className="h-1.5 w-1.5 rounded-full bg-warning-500"
                                      animate={{ opacity: [1, 0.3, 1] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    Verifying...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(doc.type); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={(e) => onDropFile(e, doc.type)}
                                className={`mt-2 cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                                  dragOver === doc.type
                                    ? 'border-parent-500 bg-parent-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(doc.type, f);
                                  }}
                                  className="hidden"
                                  id={`file-${doc.type}`}
                                />
                                <label htmlFor={`file-${doc.type}`} className="cursor-pointer">
                                  <Upload className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                                  <span className="text-xs text-gray-500">Drag & drop or click to upload</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={goBack}
                      className="flex items-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!requiredDocsUploaded}
                      className="flex flex-1 items-center justify-center rounded-xl bg-parent-600 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Generate My Passport
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 italic">Optional documents can be added later</p>
                </div>
              )}

              {/* ── Step 4: QR Generation ── */}
              {step === 3 && (
                <div className="space-y-6">
                  {showConfetti && <Confetti />}

                  <motion.div className="text-center" {...fadeUp}>
                    <motion.h2
                      className="font-display text-3xl font-bold text-parent-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Your Passport is Ready!
                    </motion.h2>
                    <p className="mt-2 text-sm text-gray-600">Welcome to the EduResult Pro network.</p>
                  </motion.div>

                  <motion.div
                    className="mx-auto max-w-[320px] rounded-2xl border border-parent-200 bg-white p-6 shadow-elevated"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {!qrReady ? (
                      <div className="flex h-[200px] items-center justify-center">
                        <motion.div
                          className="h-32 w-32 rounded-xl bg-gray-100"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    ) : (
                      <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="rounded-2xl bg-white p-3 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                          <QRCodeSVG value={qrData} size={200} level="H" includeMargin />
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                          className="mt-3 flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Blockchain Verified
                        </motion.div>
                      </motion.div>
                    )}

                    <div className="mt-4 text-center">
                      <h3 className="text-base font-semibold text-gray-900">{studentName}</h3>
                      <p className="mt-1 font-mono text-sm text-parent-600">{universalId}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Generated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>

                  {qrReady && (
                    <motion.div
                      className="mx-auto max-w-[320px] space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 }}
                    >
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-parent-600 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px">
                        <Download className="h-4 w-4" />
                        Download as Image
                      </button>
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50">
                        <Printer className="h-4 w-4" />
                        Print Passport
                      </button>
                    </motion.div>
                  )}

                  {qrReady && (
                    <motion.div
                      className="rounded-xl border border-parent-200 bg-parent-50 p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.5 }}
                    >
                      <h3 className="mb-3 text-base font-semibold text-gray-900">What Next?</h3>
                      <div className="space-y-3">
                        {[
                          { icon: Search, text: 'Discover Schools', sub: 'Browse schools and find the best match' },
                          { icon: ShoppingCart, text: 'Add Forms to Cart', sub: 'Select schools and add their forms' },
                          { icon: Store, text: 'Visit a Vendor to Pay', sub: 'Pay cash at any verified vendor location' },
                          { icon: Ticket, text: 'Get Interview Tickets', sub: 'Receive your tickets instantly after payment' },
                        ].map((item, i) => (
                          <motion.div
                            key={item.text}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2.7 + i * 0.1 }}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-parent-500 text-white">
                              <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.text}</p>
                              <p className="text-xs text-gray-500">{item.sub}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <Link
                        to="/parent/dashboard"
                        className="mt-4 flex w-full items-center justify-center rounded-xl bg-parent-600 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px"
                      >
                        Go to My Dashboard
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
