import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { academicYears, gradingScales } from '@/lib/mockData';
import {
  Calendar,
  Award,
  Users,
  ShieldAlert,
  Bell,
  Lock,
  Plus,
  RotateCcw,
  Save,
  AlertTriangle,
  X,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Shield,
  GraduationCap,
  Store,
  UserCheck,
  KeyRound,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Check,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════════ */

interface TermConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface AcademicYearFull {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  admissionOpenDate: string;
  admissionCloseDate: string;
  description: string;
  terms: TermConfig[];
}

interface GradingScaleRow {
  id: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
  color: string;
}

type RoleKey = 'super_admin' | 'school_admin' | 'vendor_manager' | 'parent_user' | 'support_staff';

interface PermissionRow {
  id: string;
  name: string;
  permissions: Record<RoleKey, boolean>;
}

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: NotificationChannel;
}

interface ProtocolCard {
  id: string;
  title: string;
  description: string;
  adjustments: string[];
  isActive: boolean;
}

interface SecuritySettings {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  autoLogoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  twoFactorEnabled: boolean;
  auditLogRetentionDays: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'academic', label: 'Academic Year', icon: Calendar },
  { id: 'grading', label: 'Grading Scale', icon: Award },
  { id: 'roles', label: 'User Roles', icon: Users },
  { id: 'emergency', label: 'Emergency Protocol', icon: ShieldAlert },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
] as const;

const ROLE_NAMES: Record<RoleKey, string> = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  vendor_manager: 'Vendor Manager',
  parent_user: 'Parent User',
  support_staff: 'Support Staff',
};

const ROLE_ICONS: Record<RoleKey, React.ElementType> = {
  super_admin: Shield,
  school_admin: GraduationCap,
  vendor_manager: Store,
  parent_user: Users,
  support_staff: UserCheck,
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#10B981',
  'A': '#34D399',
  'B+': '#3B82F6',
  'B': '#60A5FA',
  'C': '#F59E0B',
  'D': '#F97316',
  'F': '#EF4444',
};

const DEFAULT_GRADING_SCALE: GradingScaleRow[] = [
  { id: 'g1', grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 10, description: 'Outstanding', color: '#10B981' },
  { id: 'g2', grade: 'A', minPercentage: 80, maxPercentage: 89, gradePoint: 9, description: 'Excellent', color: '#34D399' },
  { id: 'g3', grade: 'B+', minPercentage: 70, maxPercentage: 79, gradePoint: 8, description: 'Very Good', color: '#3B82F6' },
  { id: 'g4', grade: 'B', minPercentage: 60, maxPercentage: 69, gradePoint: 7, description: 'Good', color: '#60A5FA' },
  { id: 'g5', grade: 'C', minPercentage: 50, maxPercentage: 59, gradePoint: 6, description: 'Average', color: '#F59E0B' },
  { id: 'g6', grade: 'D', minPercentage: 40, maxPercentage: 49, gradePoint: 5, description: 'Below Average', color: '#F97316' },
  { id: 'g7', grade: 'F', minPercentage: 0, maxPercentage: 39, gradePoint: 0, description: 'Fail', color: '#EF4444' },
];

const ALL_PERMISSIONS: PermissionRow[] = [
  { id: 'p1', name: 'View Analytics', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p2', name: 'Manage Schools', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: false } },
  { id: 'p3', name: 'Manage Vendors', permissions: { super_admin: true, school_admin: false, vendor_manager: true, parent_user: false, support_staff: false } },
  { id: 'p4', name: 'Manage Forms', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: false, support_staff: false } },
  { id: 'p5', name: 'View Applications', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: true, support_staff: true } },
  { id: 'p6', name: 'Manage Interviews', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p7', name: 'Manage Settings', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: false } },
  { id: 'p8', name: 'View Revenue', permissions: { super_admin: true, school_admin: true, vendor_manager: true, parent_user: false, support_staff: false } },
  { id: 'p9', name: 'Process Settlements', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p10', name: 'Manage Users', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p11', name: 'View Audit Trail', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p12', name: 'Send Notifications', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p13', name: 'Approve Documents', permissions: { super_admin: true, school_admin: true, vendor_manager: false, parent_user: false, support_staff: true } },
  { id: 'p14', name: 'Configure Pricing', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: false } },
  { id: 'p15', name: 'Activate Emergency Mode', permissions: { super_admin: true, school_admin: false, vendor_manager: false, parent_user: false, support_staff: false } },
];

const DEFAULT_PROTOCOLS: ProtocolCard[] = [
  {
    id: 'proto_pandemic',
    title: 'Pandemic Mode',
    description: 'Activate virtual operations during health emergencies.',
    adjustments: [
      'Switch all interviews to virtual mode',
      'Enable 50% form discount automatically',
      'Require digital-only document submission',
      'Allow installment-based fee payments',
    ],
    isActive: false,
  },
  {
    id: 'proto_disaster',
    title: 'Natural Disaster',
    description: 'Extend deadlines and provide transfer assistance.',
    adjustments: [
      'Extend all admission deadlines by 30 days',
      'Enable priority transfer processing',
      'Activate document reconstruction service',
      ' waive late fees for affected families',
    ],
    isActive: false,
  },
  {
    id: 'proto_outage',
    title: 'System Outage',
    description: 'Enable offline mode and manual backup procedures.',
    adjustments: [
      'Activate offline mode for all vendors',
      'Enable manual payment recording',
      'Switch to SMS-based ticket generation',
      'Initiate automatic data sync when restored',
    ],
    isActive: false,
  },
  {
    id: 'proto_breach',
    title: 'Security Breach',
    description: 'Immediate security lockdown and audit activation.',
    adjustments: [
      'Force password reset for all users',
      'Invalidate all active sessions',
      'Activate full audit trail logging',
      'Enable read-only mode for non-admins',
    ],
    isActive: false,
  },
];

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  { id: 't1', name: 'Welcome', subject: 'Welcome to EduResult Pro', body: 'Dear {{student_name}}, welcome to {{school_name}}! Your application journey begins here.', channel: { email: true, sms: false, whatsapp: false, push: true } },
  { id: 't2', name: 'Payment Confirmation', subject: 'Payment Received - {{amount}}', body: 'Dear {{student_name}}, we have received your payment of {{amount}} for {{school_name}}. Transaction ID: {{txn_id}}.', channel: { email: true, sms: true, whatsapp: true, push: true } },
  { id: 't3', name: 'Interview Scheduled', subject: 'Interview Scheduled - {{school_name}}', body: 'Dear {{student_name}}, your interview at {{school_name}} is scheduled for {{date}} at {{time}}. Venue: {{venue}}.', channel: { email: true, sms: true, whatsapp: false, push: true } },
  { id: 't4', name: 'Document Verified', subject: 'Document Verified Successfully', body: 'Dear {{student_name}}, your {{document_type}} has been verified and blockchain-anchored.', channel: { email: true, sms: false, whatsapp: false, push: true } },
  { id: 't5', name: 'Ticket Generated', subject: 'Interview Ticket Generated', body: 'Dear {{student_name}}, your interview ticket for {{school_name}} has been generated. Ticket No: {{ticket_number}}.', channel: { email: true, sms: true, whatsapp: true, push: true } },
];

const DEFAULT_SECURITY: SecuritySettings = {
  passwordMinLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiryDays: 90,
  autoLogoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 30,
  twoFactorEnabled: false,
  auditLogRetentionDays: 365,
};

const NOTIFICATION_HISTORY = [
  { id: 'nh1', type: 'Welcome' as const, recipient: 'Rajesh Sharma', channel: 'Email', sentAt: '2025-03-01 10:30 AM', status: 'Delivered' as const },
  { id: 'nh2', type: 'Payment Confirmation' as const, recipient: 'Suresh Gupta', channel: 'SMS', sentAt: '2025-03-01 11:15 AM', status: 'Delivered' as const },
  { id: 'nh3', type: 'Interview Scheduled' as const, recipient: 'Fatima Khan', channel: 'Email', sentAt: '2025-03-01 09:00 AM', status: 'Pending' as const },
  { id: 'nh4', type: 'Document Verified' as const, recipient: 'Lakshmi Reddy', channel: 'Push', sentAt: '2025-02-28 04:45 PM', status: 'Delivered' as const },
  { id: 'nh5', type: 'Ticket Generated' as const, recipient: 'Amit Kumar', channel: 'WhatsApp', sentAt: '2025-02-28 03:20 PM', status: 'Failed' as const },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════════ */

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════════════════ */

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-5 text-[#3B82F6]" />
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-500 ml-7">{subtitle}</p>}
    </div>
  );
}

/* ── Tab 1: Academic Year ──────────────────────────────────────────────────── */

function AcademicYearTab() {
  const [years, setYears] = useLocalStorage<AcademicYearFull[]>('settings_academic_years',
    academicYears.map((y) => ({
      ...y,
      terms: [
        { id: `${y.id}_t1`, name: 'Term 1', startDate: y.startDate, endDate: y.startDate },
        { id: `${y.id}_t2`, name: 'Term 2', startDate: y.startDate, endDate: y.startDate },
        { id: `${y.id}_t3`, name: 'Term 3', startDate: y.startDate, endDate: y.endDate },
      ],
    }))
  );
  const [showModal, setShowModal] = useState(false);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [newYear, setNewYear] = useState({ year: '', startDate: '', endDate: '' });

  const activeYear = years.find((y) => y.isActive) || years[0];

  const handleCreateYear = () => {
    if (!newYear.year || !newYear.startDate || !newYear.endDate) {
      toast.error('Please fill all fields');
      return;
    }
    const created: AcademicYearFull = {
      id: `ay_${Date.now()}`,
      year: newYear.year,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isActive: false,
      admissionOpenDate: newYear.startDate,
      admissionCloseDate: newYear.endDate,
      description: `Academic year ${newYear.year}`,
      terms: [
        { id: `term_${Date.now()}_1`, name: 'Term 1', startDate: newYear.startDate, endDate: newYear.startDate },
        { id: `term_${Date.now()}_2`, name: 'Term 2', startDate: newYear.startDate, endDate: newYear.startDate },
        { id: `term_${Date.now()}_3`, name: 'Term 3', startDate: newYear.startDate, endDate: newYear.endDate },
      ],
    };
    setYears((prev) => [...prev, created]);
    setNewYear({ year: '', startDate: '', endDate: '' });
    setShowModal(false);
    toast.success(`Academic year ${created.year} created`);
  };

  const handleToggleActive = (id: string) => {
    setYears((prev) =>
      prev.map((y) => ({ ...y, isActive: y.id === id ? !y.isActive : false }))
    );
    toast.success('Academic year status updated');
  };

  const updateTerm = (yearId: string, termId: string, field: 'startDate' | 'endDate', value: string) => {
    setYears((prev) =>
      prev.map((y) =>
        y.id === yearId
          ? { ...y, terms: y.terms.map((t) => (t.id === termId ? { ...t, [field]: value } : t)) }
          : y
      )
    );
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={Calendar} title="Academic Year Settings" subtitle="Configure the current and upcoming academic years." />

      {/* Active Year Card */}
      <Card className="mb-6 border-[#DBEAFE] bg-[#EFF6FF]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-bold text-[#1D4ED8]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {activeYear?.year || '2025-26'}
                </h3>
                <Badge className="bg-[#10B981] text-white hover:bg-[#059669]">Active</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Started: <strong>{activeYear?.startDate ? new Date(activeYear.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</strong></span>
                <span>Ends: <strong>{activeYear?.endDate ? new Date(activeYear.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</strong></span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500">Admission Window</p>
              <p className="text-sm font-medium text-gray-700">
                {activeYear?.admissionOpenDate ? new Date(activeYear.admissionOpenDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''} - {activeYear?.admissionCloseDate ? new Date(activeYear.admissionCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year List */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Academic Years</CardTitle>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="size-4 mr-1" /> Create New Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {years.map((year) => (
              <motion.div
                key={year.id}
                layout
                className={`rounded-lg border p-4 transition-colors ${year.isActive ? 'border-[#3B82F6] bg-[#EFF6FF]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedYear(expandedYear === year.id ? null : year.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedYear === year.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                    <div>
                      <span className="font-semibold text-gray-800">{year.year}</span>
                      {year.isActive && <Badge className="ml-2 bg-[#10B981] text-white">Active</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 hidden sm:inline">
                      {year.startDate} to {year.endDate}
                    </span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${year.id}`} className="text-sm text-gray-600 cursor-pointer">Active</Label>
                      <Switch
                        id={`active-${year.id}`}
                        checked={year.isActive}
                        onCheckedChange={() => handleToggleActive(year.id)}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedYear === year.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-200 ml-7">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Term Configuration</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {year.terms.map((term) => (
                            <div key={term.id} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">{term.name}</p>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-gray-500">Start Date</Label>
                                  <Input
                                    type="date"
                                    value={term.startDate}
                                    onChange={(e) => updateTerm(year.id, term.id, 'startDate', e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">End Date</Label>
                                  <Input
                                    type="date"
                                    value={term.endDate}
                                    onChange={(e) => updateTerm(year.id, term.id, 'endDate', e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Academic Year</DialogTitle>
            <DialogDescription>Set up a new academic year with start and end dates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Year Name (e.g., 2025-26)</Label>
              <Input
                value={newYear.year}
                onChange={(e) => setNewYear({ ...newYear, year: e.target.value })}
                placeholder="2025-26"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newYear.startDate}
                onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newYear.endDate}
                onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreateYear}>Create Year</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ── Tab 2: Grading Scale ──────────────────────────────────────────────────── */

function GradingScaleTab() {
  const [scale, setScale] = useLocalStorage<GradingScaleRow[]>('settings_grading_scale',
    gradingScales.map((g) => ({ ...g, color: GRADE_COLORS[g.grade] || '#6B7280' }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GradingScaleRow | null>(null);

  const handleEdit = (row: GradingScaleRow) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const handleSave = () => {
    if (!editForm) return;
    setScale((prev) => prev.map((s) => (s.id === editForm.id ? editForm : s)));
    setEditingId(null);
    setEditForm(null);
    toast.success('Grade updated');
  };

  const handleReset = () => {
    setScale(DEFAULT_GRADING_SCALE.map((g) => ({ ...g })));
    toast.success('Grading scale reset to default');
  };

  const handleDelete = (id: string) => {
    setScale((prev) => prev.filter((s) => s.id !== id));
    toast.success('Grade removed');
  };

  const handleAdd = () => {
    const newGrade: GradingScaleRow = {
      id: `grade_${Date.now()}`,
      grade: 'N',
      minPercentage: 0,
      maxPercentage: 0,
      gradePoint: 0,
      description: 'New Grade',
      color: '#6B7280',
    };
    setScale((prev) => [...prev, newGrade]);
    setEditingId(newGrade.id);
    setEditForm(newGrade);
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={Award} title="Grading Scale" subtitle="Configure grade boundaries and GPA points." />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Grade Configuration</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-4 mr-1" /> Reset to Default
              </Button>
              <Button size="sm" onClick={handleAdd}>
                <Plus className="size-4 mr-1" /> Add Grade
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Color Bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-6">
            {scale.map((s) => (
              <div
                key={s.id}
                className="h-full transition-all"
                style={{
                  width: `${s.maxPercentage - s.minPercentage}%`,
                  backgroundColor: s.color,
                  minWidth: '8px',
                }}
                title={`${s.grade}: ${s.minPercentage}-${s.maxPercentage}%`}
              />
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Grade</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Min %</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Max %</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 hidden md:table-cell">Description</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Color</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">GPA</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scale.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    style={{ borderLeft: `4px solid ${row.color}` }}
                  >
                    {editingId === row.id && editForm ? (
                      <>
                        <td className="py-2 px-2"><Input value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="h-8 w-16" /></td>
                        <td className="py-2 px-2"><Input type="number" value={editForm.minPercentage} onChange={(e) => setEditForm({ ...editForm, minPercentage: Number(e.target.value) })} className="h-8 w-20" /></td>
                        <td className="py-2 px-2"><Input type="number" value={editForm.maxPercentage} onChange={(e) => setEditForm({ ...editForm, maxPercentage: Number(e.target.value) })} className="h-8 w-20" /></td>
                        <td className="py-2 px-2 hidden md:table-cell"><Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="h-8" /></td>
                        <td className="py-2 px-2"><Input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="h-8 w-12 p-0 border-0" /></td>
                        <td className="py-2 px-2"><Input type="number" value={editForm.gradePoint} onChange={(e) => setEditForm({ ...editForm, gradePoint: Number(e.target.value) })} className="h-8 w-16" /></td>
                        <td className="py-2 px-2 text-right">
                          <Button size="icon-sm" variant="ghost" onClick={handleSave} className="text-green-600 hover:text-green-700">
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => { setEditingId(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-600">
                            <X className="size-4" />
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3 font-semibold">{row.grade}</td>
                        <td className="py-3 px-3">{row.minPercentage}</td>
                        <td className="py-3 px-3">{row.maxPercentage}</td>
                        <td className="py-3 px-3 text-gray-600 hidden md:table-cell">{row.description}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: row.color }} />
                            <span className="text-xs text-gray-500 hidden lg:inline">{row.color}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium">{row.gradePoint}</td>
                        <td className="py-3 px-3 text-right">
                          <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(row)} className="text-gray-500 hover:text-blue-600">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(row.id)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Tab 3: User Roles & Permissions ───────────────────────────────────────── */

function UserRolesTab() {
  const [permissions, setPermissions] = useLocalStorage<PermissionRow[]>('settings_permissions', ALL_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<RoleKey>('super_admin');

  const roles: RoleKey[] = ['super_admin', 'school_admin', 'vendor_manager', 'parent_user', 'support_staff'];

  const togglePermission = (permId: string, role: RoleKey) => {
    if (role === 'super_admin') return; // read-only
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permId
          ? { ...p, permissions: { ...p.permissions, [role]: !p.permissions[role] } }
          : p
      )
    );
  };

  const handleSave = () => {
    toast.success('Permissions saved successfully');
  };

  const getPermissionCount = (role: RoleKey) => {
    const total = permissions.length;
    const granted = permissions.filter((p) => p.permissions[role]).length;
    return `${granted}/${total}`;
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={Users} title="User Roles & Permissions" subtitle="Manage role-based access control across the platform." />

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {roles.map((role) => {
          const Icon = ROLE_ICONS[role];
          const isSelected = selectedRole === role;
          return (
            <motion.button
              key={role}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Icon className={`size-6 mb-2 ${isSelected ? 'text-[#3B82F6]' : 'text-gray-400'}`} />
              <p className={`text-sm font-semibold ${isSelected ? 'text-[#1D4ED8]' : 'text-gray-700'}`}>{ROLE_NAMES[role]}</p>
              <p className="text-xs text-gray-500 mt-1">{getPermissionCount(role)} permissions</p>
            </motion.button>
          );
        })}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Permission Matrix</CardTitle>
              <CardDescription>
                {selectedRole === 'super_admin'
                  ? 'Super Admin has all permissions (read-only)'
                  : `Editing permissions for ${ROLE_NAMES[selectedRole]}`}
              </CardDescription>
            </div>
            <Button onClick={handleSave} size="sm">
              <Save className="size-4 mr-1" /> Save Permissions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[200px]">Permission</th>
                  {roles.map((role) => (
                    <th key={role} className="text-center py-3 px-3 font-semibold text-gray-700 min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        {(() => { const Icon = ROLE_ICONS[role]; return <Icon className="size-4 text-gray-400" />; })()}
                        <span className="text-xs">{ROLE_NAMES[role]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, idx) => (
                  <motion.tr
                    key={perm.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">{perm.name}</td>
                    {roles.map((role) => (
                      <td key={role} className="py-3 px-3 text-center">
                        {role === 'super_admin' ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                            <Check className="size-4 text-green-600" />
                          </div>
                        ) : (
                          <Switch
                            checked={perm.permissions[role]}
                            onCheckedChange={() => togglePermission(perm.id, role)}
                            className="mx-auto"
                          />
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Tab 4: Emergency Protocol ─────────────────────────────────────────────── */

function EmergencyProtocolTab() {
  const [protocols, setProtocols] = useLocalStorage<ProtocolCard[]>('settings_emergency_protocols', DEFAULT_PROTOCOLS);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; protocolId: string; confirmText: string }>({
    open: false,
    protocolId: '',
    confirmText: '',
  });
  const [typedConfirm, setTypedConfirm] = useState('');

  const activeCount = protocols.filter((p) => p.isActive).length;

  const handleActivate = (id: string) => {
    setConfirmDialog({ open: true, protocolId: id, confirmText: 'CONFIRM' });
    setTypedConfirm('');
  };

  const handleDeactivate = (id: string) => {
    setProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
    toast.success('Protocol deactivated');
  };

  const confirmActivation = () => {
    if (typedConfirm !== confirmDialog.confirmText) {
      toast.error('Please type CONFIRM to proceed');
      return;
    }
    setProtocols((prev) =>
      prev.map((p) => (p.id === confirmDialog.protocolId ? { ...p, isActive: true } : p))
    );
    setConfirmDialog({ open: false, protocolId: '', confirmText: '' });
    setTypedConfirm('');
    toast.success('Emergency protocol activated', { icon: <AlertTriangle className="size-4 text-orange-500" /> });
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={ShieldAlert} title="Emergency Protocol" subtitle="Activate emergency measures during crises." />

      {/* Warning Banner */}
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4"
        >
          <AlertTriangle className="size-6 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Emergency Protocol Active</p>
            <p className="text-sm text-red-600">{activeCount} protocol(s) currently in effect. Review and deactivate when the crisis is resolved.</p>
          </div>
        </motion.div>
      )}

      <motion.div
        className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Warning:</strong> Emergency protocols should only be activated during genuine crises.
          These actions affect the entire platform and all connected schools.
        </p>
      </motion.div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocols.map((proto) => (
            <motion.div
              key={proto.id}
              whileHover={{ y: -2 }}
              className={`rounded-xl border-2 p-5 transition-all ${proto.isActive ? 'border-red-400 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{proto.title}</h3>
                    {proto.isActive && (
                      <Badge className="bg-red-500 text-white hover:bg-red-600 animate-pulse">ACTIVE</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{proto.description}</p>
                </div>
                <Switch
                  checked={proto.isActive}
                  onCheckedChange={(checked) => {
                    if (checked) handleActivate(proto.id);
                    else handleDeactivate(proto.id);
                  }}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Adjustments</p>
                <ul className="space-y-1">
                  {proto.adjustments.map((adj, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#3B82F6] mt-1">&#8226;</span>
                      {adj}
                    </li>
                  ))}
                </ul>
              </div>

              {proto.isActive ? (
                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleDeactivate(proto.id)}>
                  Deactivate Protocol
                </Button>
              ) : (
                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleActivate(proto.id)}>
                  <ShieldAlert className="size-4 mr-1" /> Activate
                </Button>
              )}
            </motion.div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => { if (!open) setConfirmDialog({ ...confirmDialog, open: false }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" /> Confirm Emergency Activation
            </DialogTitle>
            <DialogDescription>
              This is a critical action that will affect all users on the platform. Please type <strong>CONFIRM</strong> to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              placeholder="Type CONFIRM"
              className="border-red-300 focus-visible:ring-red-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={confirmActivation}>
              Confirm Activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ── Tab 5: Notifications ──────────────────────────────────────────────────── */

function NotificationsTab() {
  const [templates, setTemplates] = useLocalStorage<NotificationTemplate[]>('settings_notification_templates', DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0]?.id || '');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);

  useEffect(() => {
    if (currentTemplate) {
      setEditSubject(currentTemplate.subject);
      setEditBody(currentTemplate.body);
    }
  }, [selectedTemplate, currentTemplate?.id]);

  const handleSaveTemplate = () => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplate ? { ...t, subject: editSubject, body: editBody } : t))
    );
    toast.success('Template saved');
  };

  const handleSendTest = () => {
    toast.success('Test notification sent successfully');
  };

  const toggleChannel = (templateId: string, channel: keyof NotificationChannel) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId ? { ...t, channel: { ...t.channel, [channel]: !t.channel[channel] } } : t
      )
    );
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={Bell} title="Notification Settings" subtitle="Configure channels, templates, and delivery preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  selectedTemplate === t.id
                    ? 'bg-[#EFF6FF] text-[#1D4ED8] font-medium border border-[#DBEAFE]'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {t.name}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentTemplate?.name || 'Template Editor'}</CardTitle>
                <CardDescription>Customize subject and message body</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSendTest}>
                  <Send className="size-4 mr-1" /> Send Test
                </Button>
                <Button size="sm" onClick={handleSaveTemplate}>
                  <Save className="size-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Channels */}
            {currentTemplate && (
              <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-100">
                {(['email', 'sms', 'whatsapp', 'push'] as const).map((ch) => (
                  <div key={ch} className="flex items-center gap-2">
                    <Switch
                      checked={currentTemplate.channel[ch]}
                      onCheckedChange={() => toggleChannel(currentTemplate.id, ch)}
                    />
                    <Label className="text-sm capitalize flex items-center gap-1">
                      {ch === 'email' && <Mail className="size-3.5" />}
                      {ch === 'sms' && <MessageSquare className="size-3.5" />}
                      {ch === 'whatsapp' && <Smartphone className="size-3.5" />}
                      {ch === 'push' && <Send className="size-3.5" />}
                      {ch}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label>Subject Line</Label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Enter subject..."
              />
            </div>
            <div>
              <Label>Message Body</Label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Enter message body..."
                className="w-full min-h-[160px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-vertical"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{{student_name}}'}, {'{{school_name}}'}, {'{{amount}}'}, {'{{date}}'}, {'{{ticket_number}}'}, {'{{txn_id}}'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="size-5 text-gray-500" /> Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Recipient</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Channel</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Sent At</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_HISTORY.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{h.type}</td>
                    <td className="py-2.5 px-3 text-gray-600">{h.recipient}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="secondary" className="text-xs">{h.channel}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{h.sentAt}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={
                          h.status === 'Delivered'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : h.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {h.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Tab 6: Security ───────────────────────────────────────────────────────── */

function SecurityTab() {
  const [settings, setSettings] = useLocalStorage<SecuritySettings>('settings_security', DEFAULT_SECURITY);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const updateSetting = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success('Security settings saved');
  };

  return (
    <motion.div {...fadeUp}>
      <SectionTitle icon={Lock} title="Security Settings" subtitle="Configure password policies, session management, and access controls." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="size-5 text-gray-500" /> Password Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Minimum Password Length</Label>
                <span className="text-sm font-semibold text-[#3B82F6]">{settings.passwordMinLength} characters</span>
              </div>
              <Slider
                value={[settings.passwordMinLength]}
                onValueChange={(v) => updateSetting('passwordMinLength', v[0])}
                min={6}
                max={16}
                step={1}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>6</span>
                <span>16</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Require Uppercase Letters</p>
                <p className="text-xs text-gray-500">At least one uppercase character (A-Z)</p>
              </div>
              <Switch
                checked={settings.requireUppercase}
                onCheckedChange={(v) => updateSetting('requireUppercase', v)}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Require Numbers</p>
                <p className="text-xs text-gray-500">At least one numeric character (0-9)</p>
              </div>
              <Switch
                checked={settings.requireNumbers}
                onCheckedChange={(v) => updateSetting('requireNumbers', v)}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Require Special Characters</p>
                <p className="text-xs text-gray-500">At least one special character (!@#$%)</p>
              </div>
              <Switch
                checked={settings.requireSpecialChars}
                onCheckedChange={(v) => updateSetting('requireSpecialChars', v)}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Label>Password Expiry (days)</Label>
              <Input
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) => updateSetting('passwordExpiryDays', Number(e.target.value))}
                className="mt-1"
                min={1}
                max={365}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="size-5 text-gray-500" /> Session & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(v) => updateSetting('twoFactorEnabled', v)}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Label>Auto-Logout Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.autoLogoutMinutes}
                onChange={(e) => updateSetting('autoLogoutMinutes', Number(e.target.value))}
                className="mt-1"
                min={5}
                max={240}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', Number(e.target.value))}
                className="mt-1"
                min={1}
                max={10}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Label>Lockout Duration (minutes)</Label>
              <Input
                type="number"
                value={settings.lockoutDurationMinutes}
                onChange={(e) => updateSetting('lockoutDurationMinutes', Number(e.target.value))}
                className="mt-1"
                min={5}
                max={120}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <Label>Audit Log Retention (days)</Label>
              <Input
                type="number"
                value={settings.auditLogRetentionDays}
                onChange={(e) => updateSetting('auditLogRetentionDays', Number(e.target.value))}
                className="mt-1"
                min={30}
                max={1095}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Management */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="size-5 text-gray-500" /> API Key Management
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeys(!showApiKeys)}>
              {showApiKeys ? 'Hide Keys' : 'View Keys'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Production API Key</p>
                <p className="text-xs text-gray-500">Used for all production integrations</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            {showApiKeys ? (
              <code className="block bg-gray-900 text-green-400 rounded px-3 py-2 text-sm font-mono">
                erp_live_sk_a1b2c3d4e5f6789012345678901234567890
              </code>
            ) : (
              <code className="block bg-gray-200 text-gray-500 rounded px-3 py-2 text-sm font-mono">
                {'•'.repeat(48)}
              </code>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          <Save className="size-4 mr-1" /> Save Security Settings
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('academic');

  const renderTab = () => {
    switch (activeTab) {
      case 'academic': return <AcademicYearTab />;
      case 'grading': return <GradingScaleTab />;
      case 'roles': return <UserRolesTab />;
      case 'emergency': return <EmergencyProtocolTab />;
      case 'notifications': return <NotificationsTab />;
      case 'security': return <SecurityTab />;
      default: return <AcademicYearTab />;
    }
  };

  return (
    <Layout zone="admin">
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Settings
              {activeTab === 'emergency' && (
                <Badge className="bg-red-500 text-white">Emergency</Badge>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage platform-wide configuration and preferences
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#3B82F6]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="settings-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
