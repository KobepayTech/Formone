import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router';
import {
  Search,
  ShoppingCart,
  Ticket,
  FolderOpen,
  Calendar,
  Droplet,
  User,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
  ChevronRight,
  Building2,
  ShieldCheck,
  Award,
  Lightbulb,
  X,
} from 'lucide-react';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import {
  studentProfiles,
  applications,
  notifications as mockNotifications,
  gamificationProfiles,
} from '@/lib/mockData';

/* ── Animations ────────────────────────────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function ParentDashboardPage() {
  const [student] = useState(studentProfiles[0]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [notifs, setNotifs] = useState(mockNotifications.filter((n) => n.userId === 'usr_001'));
  const [xpWidth, setXpWidth] = useState(0);

  const gamification = gamificationProfiles[0];
  const studentApps = applications.filter((a) => a.studentId === student.id);

  const xpPercent =
    gamification ? Math.round((gamification.currentLevelXp / (gamification.nextLevelXp - (gamification.totalXp - gamification.currentLevelXp))) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setXpWidth(xpPercent), 500);
    return () => clearTimeout(t);
  }, [xpPercent]);

  const notifIcon = (type: string) => {
    switch (type) {
      case 'success': return { icon: CheckCircle, bg: 'bg-success-50', color: 'text-success-500' };
      case 'info': return { icon: Info, bg: 'bg-info-50', color: 'text-info-500' };
      case 'warning': return { icon: AlertTriangle, bg: 'bg-warning-50', color: 'text-warning-500' };
      case 'error': return { icon: Clock, bg: 'bg-error-50', color: 'text-error-500' };
      default: return { icon: Info, bg: 'bg-info-50', color: 'text-info-500' };
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const recentActivities = studentApps.slice(0, 5).map((app) => ({
    id: app.id,
    title: `${app.schoolName} — ${app.status.replace(/_/g, ' ')}`,
    time: new Date(app.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'info',
  }));

  const quickActions = [
    { icon: Search, label: 'Find Schools', href: '/parent/schools', color: 'text-parent-600' },
    { icon: ShoppingCart, label: 'My Cart', href: '/parent/cart', color: 'text-parent-600' },
    { icon: Ticket, label: 'Tickets', href: '/parent/tickets', color: 'text-parent-600' },
    { icon: FolderOpen, label: 'Documents', href: '/parent/documents', color: 'text-parent-600' },
  ];

  const statusStages = [
    { label: 'Profile Created', done: true },
    { label: 'Schools Selected', done: studentApps.length > 0 },
    { label: 'Payment Done', done: studentApps.some((a) => a.paymentStatus === 'completed') },
    { label: 'Tickets Generated', done: studentApps.some((a) => a.tickets.length > 0) },
    { label: 'Interview Complete', done: studentApps.some((a) => a.status === 'accepted') },
  ];

  const currentStage = statusStages.filter((s) => s.done).length;

  return (
    <Layout zone="parent">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* ── Student Identity Card ── */}
        <motion.div
          className="rounded-2xl border border-parent-200 bg-white p-5 shadow-elevated"
          {...fadeUp(0)}
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Left — Info */}
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-parent-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-parent-500">
                <ShieldCheck className="h-3 w-3" />
                Universal Passport
              </span>

              <h2 className="mt-3 font-display text-xl font-semibold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="mt-1 font-mono text-sm text-parent-600">{student.universalStudentId}</p>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {new Date(student.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Droplet className="h-3.5 w-3.5 text-gray-400" />
                  {student.bloodGroup}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  Class 1
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-info-50 px-2.5 py-0.5 text-xs font-medium text-info-500">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info-500" />
                  </span>
                  Active
                </span>
                <span className="text-xs text-gray-500">
                  {studentApps.length} school{studentApps.length !== 1 ? 's' : ''} applied
                </span>
              </div>
            </div>

            {/* Right — QR */}
            <motion.div
              className="flex flex-col items-center gap-2 sm:w-[140px]"
              whileHover={{ scale: 1.03 }}
              onClick={() => setQrModalOpen(true)}
            >
              <div className="cursor-pointer rounded-xl bg-white p-2 shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-shadow hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]">
                <QRCodeSVG
                  value={JSON.stringify({ id: student.universalStudentId, name: `${student.firstName} ${student.lastName}` })}
                  size={100}
                  level="M"
                />
              </div>
              <span className="text-xs text-gray-400">Tap to enlarge</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          className="mt-5 grid grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {quickActions.map((action) => (
            <motion.div key={action.label} variants={staggerItem}>
              <Link
                to={action.href}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-[11px] font-medium text-gray-700">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Application Tracker ── */}
        <motion.div
          className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
          {...fadeUp(0.15)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Application Status</h3>
            <span className="text-xs text-parent-600 font-medium">{currentStage} of {statusStages.length} stages</span>
          </div>

          {/* Horizontal timeline */}
          <div className="mb-5 flex items-center gap-1">
            {statusStages.map((stage, idx) => (
              <div key={stage.label} className="flex flex-1 flex-col items-center">
                <motion.div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    stage.done
                      ? 'bg-success-500 text-white'
                      : idx === currentStage
                      ? 'bg-parent-500 text-white ring-4 ring-parent-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
                >
                  {stage.done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                </motion.div>
                <span className={`mt-1 hidden text-center text-[10px] font-medium sm:block ${stage.done || idx === currentStage ? 'text-gray-700' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          {/* Applications list */}
          <div className="space-y-2">
            {studentApps.slice(0, 4).map((app, idx) => (
              <motion.div
                key={app.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-parent-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.schoolName}</p>
                    <p className="text-xs text-gray-500">{app.formType} form</p>
                  </div>
                </div>
                <StatusBadge status={app.status} type="application" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Notification Feed ── */}
        <motion.div
          className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
          {...fadeUp(0.25)}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-parent-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {notifs.slice(0, 5).map((notif, idx) => {
              const { icon: Icon, bg, color } = notifIcon(notif.type);
              return (
                <motion.div
                  key={notif.id}
                  className={`relative flex items-start gap-3 rounded-xl p-3 transition-colors ${
                    !notif.read ? 'bg-info-50/50' : 'hover:bg-gray-50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                >
                  {!notif.read && (
                    <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-parent-500" />
                  )}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Gamification Panel ── */}
        {gamification && (
          <motion.div
            className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
            {...fadeUp(0.35)}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {/* Rank Badge */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-gold bg-gradient-to-br from-gold/20 to-transparent">
                  <span className="font-display text-2xl font-bold text-gold">
                    {gamification.rank === 'gold' ? 'G' : gamification.rank === 'silver' ? 'S' : 'B'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-medium capitalize text-gray-600">{gamification.rank} Guardian</p>
              </motion.div>

              <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{gamification.levelTitle}</h3>
                  <span className="text-xs text-gray-500">
                    {gamification.totalXp.toLocaleString()} / {gamification.nextLevelXp.toLocaleString()} XP
                  </span>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-parent-400 to-parent-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpWidth}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                  />
                </div>

                {/* Stats Row */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Applications', value: gamification.formsPurchased, color: 'text-parent-600' },
                    { label: 'Documents', value: 4, color: 'text-success-500' },
                    { label: 'Savings', value: `Rs. ${Math.floor(gamification.formsPurchased * 30)}`, color: 'text-vendor-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                <div className="mt-3 flex items-center gap-2">
                  {gamification.badges.slice(0, 3).map((badge) => (
                    <motion.div
                      key={badge.id}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold bg-gold/10"
                      title={badge.name}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Award className="h-4 w-4 text-gold" />
                    </motion.div>
                  ))}
                  {gamification.badges.length > 3 && (
                    <span className="text-xs text-gray-400">+{gamification.badges.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recent Activity ── */}
        <motion.div
          className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
          {...fadeUp(0.45)}
        >
          <h3 className="mb-3 text-base font-semibold text-gray-900">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.map((act, idx) => (
              <motion.div
                key={act.id}
                className="flex items-center justify-between rounded-lg py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.06 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${act.type === 'success' ? 'bg-success-500' : act.type === 'error' ? 'bg-error-500' : 'bg-info-500'}`} />
                  <span className="text-sm text-gray-700">{act.title}</span>
                </div>
                <span className="text-xs text-gray-400">{act.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Tips ── */}
        <motion.div
          className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5"
          {...fadeUp(0.55)}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-warning-500" />
            <h3 className="text-sm font-semibold text-gray-900">Quick Tips</h3>
          </div>
          <ul className="space-y-2">
            {[
              'Apply to 3+ schools to unlock bulk discount',
              'Upload all documents early for faster verification',
              'Visit vendors during non-peak hours for quicker service',
            ].map((tip, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
              >
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setQrModalOpen(false)}
        >
          <motion.div
            className="relative rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
            <QRCodeSVG
              value={JSON.stringify({ id: student.universalStudentId, name: `${student.firstName} ${student.lastName}` })}
              size={280}
              level="H"
              includeMargin
            />
            <p className="mt-3 text-center text-sm font-medium text-gray-700">{student.firstName} {student.lastName}</p>
            <p className="text-center font-mono text-xs text-parent-600">{student.universalStudentId}</p>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
