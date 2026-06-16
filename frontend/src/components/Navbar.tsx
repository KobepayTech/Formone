import { useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap,
  Bell,
  Menu,
  X,
  Users,
  Store,
  Building2,
  LayoutDashboard,
  Search,
  ShoppingCart,
  Ticket,
  FolderOpen,
  Settings,
  CreditCard,
  Printer,
  Clock,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface NavLink { label: string; href: string; icon?: LucideIcon }

interface NavbarProps {
  zone: 'parent' | 'vendor' | 'school' | 'admin' | 'public';
}

const Navbar: FC<NavbarProps> = ({ zone }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const zoneConfig = {
    public: {
      color: 'border-b-gray-200',
      accent: 'text-brand-600',
      bg: 'bg-white',
      label: '',
      labelColor: '',
    },
    parent: {
      color: 'border-b-parent-500',
      accent: 'text-parent-600',
      bg: 'bg-white',
      label: '',
      labelColor: '',
    },
    vendor: {
      color: 'border-b-vendor-500',
      accent: 'text-vendor-600',
      bg: 'bg-white',
      label: 'VENDOR PORTAL',
      labelColor: 'text-vendor-500',
    },
    school: {
      color: 'border-b-school-500',
      accent: 'text-school-600',
      bg: 'bg-white',
      label: 'SCHOOL PORTAL',
      labelColor: 'text-school-500',
    },
    admin: {
      color: 'border-b-admin-500',
      accent: 'text-admin-600',
      bg: 'bg-white',
      label: 'PLATFORM ADMIN',
      labelColor: 'text-admin-500',
    },
  };

  const config = zoneConfig[zone];

  const publicLinks: NavLink[] = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Schools', href: '/#schools' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Trust & Safety', href: '/#trust' },
  ];

  const parentLinks: NavLink[] = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Schools', href: '/parent/schools', icon: Search },
    { label: 'Cart', href: '/parent/cart', icon: ShoppingCart },
    { label: 'Tickets', href: '/parent/tickets', icon: Ticket },
    { label: 'Documents', href: '/parent/documents', icon: FolderOpen },
  ];

  const vendorLinks: NavLink[] = [
    { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Payments', href: '/vendor/payments', icon: CreditCard },
    { label: 'Tickets', href: '/vendor/tickets', icon: Printer },
    { label: 'History', href: '/vendor/dashboard', icon: Clock },
  ];

  const schoolLinks: NavLink[] = [
    { label: 'Dashboard', href: '/school/applicants', icon: LayoutDashboard },
    { label: 'Applicants', href: '/school/applicants', icon: Users },
    { label: 'Interviews', href: '/school/interviews', icon: Calendar },
    { label: 'Reports', href: '/school/applicants', icon: BarChart3 },
  ];

  const adminLinks: NavLink[] = [
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Schools', href: '/admin/schools', icon: Building2 },
    { label: 'Vendors', href: '/admin/vendors', icon: Store },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const getLinks = () => {
    switch (zone) {
      case 'parent': return parentLinks;
      case 'vendor': return vendorLinks;
      case 'school': return schoolLinks;
      case 'admin': return adminLinks;
      default: return publicLinks;
    }
  };

  const links = getLinks();

  return (
    <nav className={`sticky top-0 z-50 border-b-4 ${config.color} ${config.bg}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-[72px] items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className={`h-7 w-7 ${config.accent}`} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-bold text-gray-900">
                EduResult Pro
              </span>
              <span className="rounded bg-brand-500 px-1 py-0.5 text-[10px] font-bold text-white">
                v2.0
              </span>
              {config.label && (
                <span className={`hidden sm:inline text-xs font-semibold tracking-wide ${config.labelColor}`}>
                  {config.label}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) =>
              'icon' in link ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {zone === 'public' && (
              <>
                <Link
                  to="/register"
                  className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  Parent Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
                >
                  Get Started
                </Link>
              </>
            )}
            {zone !== 'public' && (
              <>
                <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-brand-600" />
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) =>
                'icon' in link ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                )
              )}
              {zone === 'public' && (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center rounded-lg border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-600"
                  >
                    Parent Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
