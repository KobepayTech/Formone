import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Folder,
  CheckCircle,
  Shield,
  AlertCircle,
  UploadCloud,
  X,
  Eye,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  Plus,
  Link2,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { vaultDocuments, studentProfiles } from '@/lib/mockData';
import type { DocumentType, DocumentVerificationStatus } from '@/types';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface DocUploadState {
  type: DocumentType;
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'scanning' | 'analyzing' | 'verified' | 'anchoring' | 'done';
  confidence: number;
}

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const cardStagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ── Document Type Config ──────────────────────────────────────────────────── */

const docTypeConfig: Record<DocumentType, { label: string; icon: typeof FileText }> = {
  birth_certificate: { label: 'Birth Certificate', icon: FileText },
  marksheet: { label: 'Marksheet', icon: FileText },
  transfer_certificate: { label: 'Transfer Certificate', icon: FileText },
  medical_record: { label: 'Medical Record', icon: FileText },
  aadhar_card: { label: 'Aadhar Card', icon: FileText },
  passport_photo: { label: 'Passport Photo', icon: FileText },
  address_proof: { label: 'Address Proof', icon: FileText },
  caste_certificate: { label: 'Caste Certificate', icon: FileText },
  income_certificate: { label: 'Income Certificate', icon: FileText },
  migration_certificate: { label: 'Migration Certificate', icon: FileText },
};

const getDocTypeLabel = (type: DocumentType): string => docTypeConfig[type]?.label || type;
const getDocTypeIcon = (type: DocumentType) => docTypeConfig[type]?.icon || FileText;

/* ── Format File Size ──────────────────────────────────────────────────────── */

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function DocumentVaultPage() {
  const [student] = useState(studentProfiles[0]);
  const [docs, setDocs] = useState(vaultDocuments.filter((d) => d.studentId === student.id));
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<typeof docs[0] | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  /* Upload modal state */
  const [uploadState, setUploadState] = useState<DocUploadState>({
    type: 'birth_certificate',
    file: null,
    progress: 0,
    status: 'idle',
    confidence: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = docs.length;
    const verified = docs.filter((d) => d.verificationStatus === 'verified' || d.verificationStatus === 'blockchain_anchored').length;
    const anchored = docs.filter((d) => d.verificationStatus === 'blockchain_anchored').length;
    const pending = docs.filter((d) => d.verificationStatus === 'pending').length;
    return { total, verified, anchored, pending };
  }, [docs]);

  const handleFileSelect = (file: File) => {
    setUploadState((prev) => ({ ...prev, file, progress: 0, status: 'uploading' }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setUploadState((prev) => ({ ...prev, progress: Math.min(100, progress) }));

      if (progress >= 100) {
        clearInterval(interval);
        // Start AI verification flow
        setTimeout(() => {
          setUploadState((prev) => ({ ...prev, status: 'scanning' }));
          setTimeout(() => {
            setUploadState((prev) => ({ ...prev, status: 'analyzing' }));
            setTimeout(() => {
              const confidence = Math.floor(Math.random() * 15) + 85;
              setUploadState((prev) => ({ ...prev, status: 'verified', confidence }));
              setTimeout(() => {
                setUploadState((prev) => ({ ...prev, status: 'anchoring' }));
                setTimeout(() => {
                  setUploadState((prev) => ({ ...prev, status: 'done' }));
                  // Add the new document to the list
                  const newDoc = {
                    id: `doc_new_${Date.now()}`,
                    studentId: student.id,
                    documentType: uploadState.type,
                    fileUrl: URL.createObjectURL(file),
                    fileName: file.name,
                    uploadDate: new Date().toISOString(),
                    verificationStatus: 'blockchain_anchored' as DocumentVerificationStatus,
                    aiConfidenceScore: confidence / 100,
                    blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                    blockchainAnchoredAt: new Date().toISOString(),
                    fileSize: file.size,
                    mimeType: file.type,
                  };
                  setDocs((prev) => [newDoc, ...prev]);
                  setTimeout(() => {
                    setUploadModalOpen(false);
                    setUploadState({ type: 'birth_certificate', file: null, progress: 0, status: 'idle', confidence: 0 });
                  }, 1200);
                }, 1200);
              }, 800);
            }, 1200);
          }, 800);
        }, 400);
      }
    }, 120);
  };

  const onDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      handleFileSelect(file);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.9) return 'text-success-500';
    if (score >= 0.7) return 'text-warning-500';
    return 'text-error-500';
  };

  const getConfidenceBarColor = (score?: number) => {
    if (!score) return 'bg-gray-300';
    if (score >= 0.9) return 'bg-success-500';
    if (score >= 0.7) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ── Header ── */}
        <motion.div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center" {...fadeUp(0)}>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-parent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(29,78,216,0.3)] transition-all hover:bg-parent-700 hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" />
            Upload New Document
          </button>
        </motion.div>

        {/* ── Vault Summary Bar ── */}
        <motion.div
          className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-parent-200 bg-gradient-to-r from-parent-50 to-white p-4 sm:grid-cols-4"
          {...fadeUp(0.1)}
        >
          {[
            { icon: Folder, label: 'Documents', value: stats.total, color: 'text-parent-500' },
            { icon: CheckCircle, label: 'Verified', value: stats.verified, color: 'text-success-500' },
            { icon: Shield, label: 'Blockchain', value: stats.anchored, color: 'text-brand-500' },
            { icon: AlertCircle, label: 'Pending', value: stats.pending, color: 'text-warning-500' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <div>
                <motion.p
                  className="text-xl font-bold text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={stat.value}
                >
                  {stat.value}
                </motion.p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Document Grid ── */}
        {docs.length === 0 ? (
          <motion.div className="mt-12 text-center" {...fadeUp(0)}>
            <Folder className="mx-auto h-16 w-16 text-gray-200" />
            <h3 className="mt-3 text-lg font-semibold text-gray-700">Your Document Vault is Empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your child&apos;s documents to use them across all school applications.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={cardStagger}
            initial="initial"
            animate="animate"
          >
            {docs.map((doc) => {
              const DocIcon = getDocTypeIcon(doc.documentType);
              const isPending = doc.verificationStatus === 'pending';
              const isAnchored = doc.verificationStatus === 'blockchain_anchored';

              return (
                <motion.div
                  key={doc.id}
                  variants={cardItem}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
                    isPending ? 'border-dashed border-warning-300' : 'border-gray-200'
                  }`}
                  onClick={() => setDetailDoc(doc)}
                >
                  {/* Icon Area */}
                  <div className={`relative h-40 flex items-center justify-center ${isPending ? 'bg-warning-50/50' : 'bg-gray-50'}`}>
                    <motion.div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                        isPending ? 'bg-warning-100 text-warning-500' : 'bg-parent-100 text-parent-500'
                      }`}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <DocIcon className="h-8 w-8" />
                    </motion.div>

                    {/* Status Badge */}
                    <div className="absolute right-3 top-3">
                      <StatusBadge status={doc.verificationStatus} type="document" />
                    </div>

                    {/* Blockchain Badge */}
                    {isAnchored && (
                      <div
                        className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 animate-pulse"
                      >
                        <Link2 className="h-3 w-3" />
                        Blockchain
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900">{getDocTypeLabel(doc.documentType)}</h3>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{doc.fileName}</p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>·</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>

                    {/* AI Confidence */}
                    {doc.aiConfidenceScore ? (
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">AI Verification</span>
                          <span className={`text-[10px] font-bold ${getConfidenceColor(doc.aiConfidenceScore)}`}>
                            {Math.round(doc.aiConfidenceScore * 100)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            className={`h-full rounded-full ${getConfidenceBarColor(doc.aiConfidenceScore)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${doc.aiConfidenceScore * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ) : isPending ? (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-warning-600">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-warning-500"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        Verification in progress...
                      </div>
                    ) : null}

                    {/* Blockchain Hash */}
                    {doc.blockchainHash && (
                      <div className="mt-2 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 shrink-0 text-brand-500" />
                        <span className="truncate font-mono text-[10px] text-gray-400">
                          {doc.blockchainHash.slice(0, 18)}...{doc.blockchainHash.slice(-6)}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyHash(doc.blockchainHash!); }}
                          className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          {copiedHash ? <Check className="h-3 w-3 text-success-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex gap-1 border-t border-gray-100 pt-3">
                      <button className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUploadModalOpen(false)}
          >
            <motion.div
              className="h-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Document Type */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    value={uploadState.type}
                    onChange={(e) => setUploadState((prev) => ({ ...prev, type: e.target.value as DocumentType }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-parent-500 focus:ring-2 focus:ring-parent-200"
                  >
                    {Object.entries(docTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Upload Area */}
                <div className="mt-4">
                  {!uploadState.file ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDropFile}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                        dragOver ? 'border-parent-500 bg-parent-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                        className="hidden"
                      />
                      <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-600">Drag & drop or click to browse</p>
                      <p className="mt-1 text-xs text-gray-400">PDF, JPG, PNG. Max 5MB</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-parent-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{uploadState.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(uploadState.file.size)}</p>
                        </div>
                        <button
                          onClick={() => setUploadState((prev) => ({ ...prev, file: null, progress: 0, status: 'idle' }))}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Progress */}
                      {uploadState.status === 'uploading' && (
                        <div className="mt-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              className="h-full rounded-full bg-parent-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadState.progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs text-gray-500">{uploadState.progress}%</p>
                        </div>
                      )}

                      {/* AI Verification Animation */}
                      {uploadState.status === 'scanning' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-parent-600">
                          <motion.div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-parent-100"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </motion.div>
                          Scanning document...
                        </div>
                      )}

                      {uploadState.status === 'analyzing' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-parent-600">
                          <motion.div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-parent-100"
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </motion.div>
                          AI analyzing content...
                        </div>
                      )}

                      {uploadState.status === 'verified' && (
                        <motion.div
                          className="mt-3 flex items-center gap-2 text-xs text-success-600"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Verified ({uploadState.confidence}% confidence)
                        </motion.div>
                      )}

                      {uploadState.status === 'anchoring' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-brand-600">
                          <motion.div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </motion.div>
                          Anchoring to blockchain...
                        </div>
                      )}

                      {uploadState.status === 'done' && (
                        <motion.div
                          className="mt-3 flex items-center gap-2 text-xs text-success-600"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <CheckCircle className="h-5 w-5 text-success-500" />
                          </motion.div>
                          Document uploaded & anchored!
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setUploadModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => uploadState.file && uploadState.status === 'idle' && handleFileSelect(uploadState.file)}
                    disabled={!uploadState.file || uploadState.status !== 'idle'}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-parent-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-parent-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload & Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Document Detail Modal ── */}
      <AnimatePresence>
        {detailDoc && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailDoc(null)}
          >
            <motion.div
              className="h-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-parent-100 text-parent-600">
                      {(() => {
                        const DocIcon = getDocTypeIcon(detailDoc.documentType);
                        return <DocIcon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{getDocTypeLabel(detailDoc.documentType)}</h2>
                      <p className="text-xs text-gray-500">{detailDoc.fileName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailDoc(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Blockchain Verification QR */}
                {detailDoc.blockchainHash && (
                  <div className="mt-5 flex flex-col items-center">
                    <motion.div
                      className="rounded-2xl bg-white p-4 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <QRCodeSVG
                        value={JSON.stringify({
                          hash: detailDoc.blockchainHash,
                          type: detailDoc.documentType,
                          verified: true,
                        })}
                        size={160}
                        level="H"
                      />
                    </motion.div>
                    <p className="mt-2 text-xs text-gray-500">Blockchain Verification QR</p>
                  </div>
                )}

                {/* Details */}
                <div className="mt-5 space-y-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={detailDoc.verificationStatus} type="document" />
                  </div>

                  {detailDoc.aiConfidenceScore && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">AI Confidence</span>
                      <span className={`font-semibold ${getConfidenceColor(detailDoc.aiConfidenceScore)}`}>
                        {Math.round(detailDoc.aiConfidenceScore * 100)}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">File Size</span>
                    <span className="font-medium text-gray-900">{formatFileSize(detailDoc.fileSize)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Uploaded</span>
                    <span className="font-medium text-gray-900">
                      {new Date(detailDoc.uploadDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {detailDoc.blockchainHash && (
                    <>
                      <div className="h-px bg-gray-200" />
                      <div>
                        <span className="text-xs text-gray-500">Blockchain Hash</span>
                        <div className="mt-1 flex items-center gap-2 rounded-lg bg-white p-2">
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                          <span className="truncate font-mono text-xs text-gray-600">
                            {detailDoc.blockchainHash}
                          </span>
                          <button
                            onClick={() => copyHash(detailDoc.blockchainHash!)}
                            className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
                          >
                            {copiedHash ? <Check className="h-3.5 w-3.5 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {detailDoc.blockchainAnchoredAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Anchored At</span>
                          <span className="font-medium text-gray-900">
                            {new Date(detailDoc.blockchainAnchoredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Trust badge */}
                {detailDoc.verificationStatus === 'blockchain_anchored' && (
                  <motion.div
                    className="mt-4 flex items-center gap-2 rounded-xl bg-success-50 p-3 text-xs text-success-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    This document&apos;s integrity is cryptographically guaranteed
                  </motion.div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-parent-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-parent-700">
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
