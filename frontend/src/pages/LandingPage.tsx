import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Store,
  FileCheck,
  UserPlus,
  Search,
  Ticket,
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  MapPin,
  Star,
  Flame,
  GraduationCap,
  Store as StoreIcon,
} from 'lucide-react';
import { schools } from '@/lib/mockData';
import Layout from '@/components/Layout';

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ── Animated Counter Component ────────────────────────────────────────────────

const AnimatedCounter: FC<{ target: number; suffix?: string; prefix?: string }> = ({
  target,
  suffix = '',
  prefix = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(easeOut * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ── FAQ Item Component ────────────────────────────────────────────────────────

const FAQItem: FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="border-b border-gray-200"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm sm:text-base font-medium text-gray-900 pr-4">{question}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────

const LandingPage: FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const zonesRef = useRef<HTMLDivElement>(null);
  const schoolsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const statsInView = useInView(statsRef, { once: true, margin: '-20%' });
  const howInView = useInView(howRef, { once: true, margin: '-15%' });
  const zonesInView = useInView(zonesRef, { once: true, margin: '-15%' });
  const schoolsInView = useInView(schoolsRef, { once: true, margin: '-15%' });
  const trustInView = useInView(trustRef, { once: true, margin: '-15%' });
  const pricingInView = useInView(pricingRef, { once: true, margin: '-15%' });
  const faqInView = useInView(faqRef, { once: true, margin: '-15%' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-15%' });

  const stats = [
    { number: 2400, suffix: '+', label: 'Schools in Network', icon: Building2 },
    { number: 50000, suffix: '+', label: 'Parents Served', icon: Users },
    { number: 850, suffix: '+', label: 'Verified Vendors', icon: Store },
    { number: 180000, suffix: '+', label: 'Forms Processed', icon: FileCheck },
  ];

  const steps = [
    {
      number: '1',
      icon: UserPlus,
      title: 'Create Your Passport',
      description:
        'Register with your phone number, create your child\'s master profile with all details, and upload documents to your secure vault.',
    },
    {
      number: '2',
      icon: Search,
      title: 'Discover & Select Schools',
      description:
        'Our AI matching engine shows compatible schools. Filter by board, fees, location, and facilities. Add forms to your cart.',
    },
    {
      number: '3',
      icon: Ticket,
      title: 'Pay & Get Tickets',
      description:
        'Visit any verified vendor to pay in cash. They\'ll confirm payment, deduct tokens, and print your interview tickets instantly.',
    },
  ];

  const zoneCards = [
    {
      title: 'For Parents',
      icon: Users,
      color: 'parent',
      description:
        'Apply to multiple schools with one profile. Track applications in real-time. Secure document vault with blockchain verification.',
      features: [
        'Universal QR Passport for all schools',
        'AI-powered school matching',
        'Document vault with blockchain anchoring',
        'Real-time application tracking',
      ],
      cta: 'Get Started as Parent',
      ctaLink: '/register',
    },
    {
      title: 'For Vendors',
      icon: StoreIcon,
      color: 'vendor',
      description:
        'Earn by helping parents process payments and print tickets. Real-time payment queue, instant token rewards, and comprehensive earnings dashboard.',
      features: [
        'Real-time payment notifications',
        'Cash payment processing terminal',
        'Instant ticket printing',
        'Daily earnings & commission tracking',
      ],
      cta: 'Become a Vendor',
      ctaLink: '/vendor/login',
    },
    {
      title: 'For Schools',
      icon: GraduationCap,
      color: 'school',
      description:
        'Get verified applicants with pre-checked documents. Manage interviews efficiently. Track revenue and applicant analytics in real-time.',
      features: [
        'Verified applicants with blockchain docs',
        'Interview scheduling & management',
        'Real-time revenue dashboard',
        'Applicant analytics & insights',
      ],
      cta: 'Join as School',
      ctaLink: '/school/login',
    },
  ];

  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Blockchain Document Verification',
      description: 'Every document is anchored to the blockchain, creating an immutable record of authenticity.',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Encryption',
      description: 'All data is encrypted at rest and in transit using AES-256 encryption standards.',
    },
    {
      icon: UserCheck,
      title: 'Verified Vendor Network',
      description: 'Every payment vendor is KYC-verified, trained, and audited regularly.',
    },
    {
      icon: FileCheck2,
      title: 'Regulatory Compliant',
      description: 'Fully compliant with education board regulations and data protection laws.',
    },
  ];

  const faqs = [
    {
      question: 'What is the Universal QR Passport?',
      answer:
        'The Universal QR Passport is a unique QR code generated for each student after registration. This single QR code works across all schools in our network, eliminating the need to fill separate forms for each school.',
    },
    {
      question: 'How does the AI school matching work?',
      answer:
        'Our AI engine analyzes your child\'s profile, academic history, location, and preferences to recommend schools with the highest compatibility score. It considers board type, fee range, facilities, and past admission data.',
    },
    {
      question: 'How do I pay for school forms?',
      answer:
        'Payments are made in cash through our network of verified vendors. After selecting schools in your cart, visit any nearby vendor, show your QR code, and pay the total amount. The vendor confirms the payment instantly.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use AES-256 encryption for all data, blockchain anchoring for document verification, and comply with all data protection regulations. Your data is never shared without consent.',
    },
    {
      question: 'Can schools see my documents?',
      answer:
        'Schools can only see documents you\'ve specifically authorized for their application. Each document sharing requires your explicit permission.',
    },
  ];

  const featuredSchools = schools.slice(0, 6);

  const getZoneStyles = (color: string) => {
    switch (color) {
      case 'parent':
        return {
          header: 'bg-parent-500',
          iconBg: 'bg-parent-50',
          icon: 'text-parent-500',
          title: 'text-parent-900',
          check: 'text-parent-500',
          cta: 'bg-parent-500 hover:bg-parent-600',
        };
      case 'vendor':
        return {
          header: 'bg-vendor-500',
          iconBg: 'bg-vendor-50',
          icon: 'text-vendor-500',
          title: 'text-vendor-900',
          check: 'text-vendor-500',
          cta: 'bg-vendor-500 hover:bg-vendor-600',
        };
      case 'school':
        return {
          header: 'bg-school-500',
          iconBg: 'bg-school-50',
          icon: 'text-school-500',
          title: 'text-school-900',
          check: 'text-school-500',
          cta: 'bg-school-500 hover:bg-school-600',
        };
      default:
        return {
          header: 'bg-brand-500',
          iconBg: 'bg-brand-50',
          icon: 'text-brand-500',
          title: 'text-gray-900',
          check: 'text-brand-500',
          cta: 'bg-brand-500 hover:bg-brand-600',
        };
    }
  };

  return (
    <Layout zone="public">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 min-h-[100dvh] flex items-center">
        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-brand-400/15 blur-[80px] animate-float" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-school-400/15 blur-[80px] animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-56 w-56 rounded-full bg-vendor-400/15 blur-[80px] animate-float" style={{ animationDelay: '2s' }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Overline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <span className="inline-block rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-white uppercase">
                  v2.0 NOW LIVE
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-[64px]"
              >
                One QR Code. Every School.{' '}
                <span className="text-brand-600">Universal Education Passport.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="max-w-[540px] text-lg text-gray-600 leading-relaxed"
              >
                Join 50,000+ parents who&apos;ve simplified school admissions. Apply to multiple schools
                with a single profile, pay through verified vendors, and track everything in one place.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:bg-brand-600 hover:-translate-y-0.5 transition-all duration-150"
                >
                  Create Your Passport — It&apos;s Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  Watch How It Works
                </a>
              </motion.div>

              {/* Trust micro-bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="flex flex-wrap items-center gap-4 text-sm text-gray-500"
              >
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-brand-500" />
                  Trusted by 2,400+ Schools
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-brand-500" />
                  50,000+ Parents
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-brand-500" />
                  850+ Verified Vendors
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="hidden lg:flex justify-center"
            >
              <img
                src="./hero-illustration.png"
                alt="Parent scanning QR code at school"
                className="max-w-[520px] w-full object-contain animate-float"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={statsRef}>
          <motion.div
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center"
              >
                <stat.icon className="mb-2 h-6 w-6 text-brand-500" />
                <span className="font-display text-2xl font-bold text-brand-600 sm:text-3xl lg:text-[40px] leading-tight">
                  <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                </span>
                <span className="mt-1 text-sm text-gray-500">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 py-16 lg:py-24" ref={howRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={howInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
              HOW IT WORKS
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-[32px]">
              Your Admission Journey in 3 Simple Steps
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-3 max-w-[600px] text-base text-gray-500">
              From creating your profile to getting interview tickets — everything in one place.
            </motion.p>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial="hidden"
            animate={howInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="relative grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {/* Connecting line (desktop) */}
            <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-brand-200" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={i}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white font-display text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <div className="mt-6 rounded-2xl bg-white p-8 shadow-elevated w-full">
                  <step.icon className="mx-auto mb-4 h-12 w-12 text-brand-500" />
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Three Zones ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24" ref={zonesRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={zonesInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
              FOR EVERYONE IN THE ECOSYSTEM
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-[32px]">
              Three Zones. One Seamless Platform.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-3 max-w-[600px] text-base text-gray-500">
              Whether you&apos;re a parent, school, or vendor — EduResult Pro has you covered.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={zonesInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {zoneCards.map((zone, i) => {
              const styles = getZoneStyles(zone.color);
              return (
                <motion.div
                  key={zone.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`rounded-xl border border-gray-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200`}
                >
                  <div className={`h-2 -mx-6 -mt-6 rounded-t-xl ${styles.header}`} />
                  <div className={`mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}>
                    <zone.icon className={`h-6 w-6 ${styles.icon}`} />
                  </div>
                  <h3 className={`mt-4 font-display text-xl font-semibold ${styles.title}`}>
                    {zone.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {zone.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {zone.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className={`h-4 w-4 shrink-0 ${styles.check}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      to={zone.ctaLink}
                      className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white ${styles.cta} transition-colors shadow-sm`}
                    >
                      {zone.cta}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Schools ────────────────────────────────────────────── */}
      <section id="schools" className="bg-gray-50 py-16 lg:py-24" ref={schoolsRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={schoolsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
                FEATURED SCHOOLS
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-[32px]">
                Schools in Our Network
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mt-2 text-base text-gray-500">
                Discover top-rated schools with verified credentials and excellent outcomes.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={3}>
              <Link to="/parent/schools" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                View All Schools <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={schoolsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredSchools.map((school, i) => (
              <motion.div
                key={school.id}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -3 }}
                className="group rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                  {school.image ? (
                    <img
                      src={school.image}
                      alt={school.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-50">
                      <Building2 className="h-16 w-16 text-brand-200" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold text-gray-900 truncate">
                    {school.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {school.city}, {school.state}
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-info-50 px-2 py-0.5 text-xs font-medium text-info-500">
                      {school.boardType}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {school.rating}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Fees: TSh {(school.feesRange.min / 1000).toFixed(0)}K-{(school.feesRange.max / 1000).toFixed(0)}K/yr
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      school.demandLevel === 'high' || school.demandLevel === 'critical'
                        ? 'text-urgent-500'
                        : school.demandLevel === 'medium'
                          ? 'text-warning-500'
                          : 'text-success-500'
                    }`}>
                      {(school.demandLevel === 'high' || school.demandLevel === 'critical') && <Flame className="h-3 w-3" />}
                      {school.demandLevel === 'high' ? 'High Demand' : school.demandLevel === 'medium' ? 'Medium' : 'Limited Seats'}
                    </span>
                  </div>
                  <Link
                    to="/parent/schools"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust & Security ────────────────────────────────────────────── */}
      <section id="trust" className="bg-white py-16 lg:py-24" ref={trustRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            {/* Left: Features */}
            <motion.div
              initial="hidden"
              animate={trustInView ? 'visible' : 'hidden'}
              variants={staggerContainer}
            >
              <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
                TRUST & SECURITY
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl lg:text-[32px]">
                Your Data is Protected. Your Credentials are Verified.
              </motion.h2>
              <div className="mt-8 space-y-6">
                {trustFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    custom={i + 2}
                    className="flex gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <feature.icon className="h-5 w-5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Illustration + badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={trustInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-full max-w-[400px]">
                <img
                  src="./trust-badge.png"
                  alt="Trust and security badge"
                  className="w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {/* Trust badges row */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-600">
                  <ShieldCheck className="h-4 w-4" />
                  Norton Secured
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-600">
                  <Lock className="h-4 w-4" />
                  SSL Certified
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                  <FileCheck className="h-4 w-4" />
                  ISO 27001
                </div>
              </div>
              {/* Media mentions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={trustInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-6 flex items-center gap-6 text-xs text-gray-400"
              >
                <span>As seen on:</span>
                <span className="font-display font-semibold text-gray-500">Education Times</span>
                <span className="font-display font-semibold text-gray-500">EdTech Weekly</span>
                <span className="font-display font-semibold text-gray-500">School Review</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ─────────────────────────────────────────────── */}
      <section id="pricing" className="bg-brand-50 py-16 lg:py-20" ref={pricingRef}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={pricingInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="mb-12 text-center"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
              TRANSPARENT PRICING
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              Simple, Fair Pricing for Everyone
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-3 max-w-[600px] text-base text-gray-600">
              No hidden fees. No surprises. Parents pay per form. Schools and vendors join for free.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={pricingInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {/* School Card */}
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
              <h3 className="font-display text-base font-semibold text-gray-900">For Schools</h3>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold text-school-600">FREE</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Join the network, get verified applicants, pay zero platform fees.
              </p>
              <ul className="mt-4 space-y-2">
                {['Applicant Dashboard', 'Interview Management', 'Revenue Reports', 'Analytics'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-school-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/school/login"
                className="mt-6 block w-full text-center rounded-lg bg-school-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-school-600 transition-colors"
              >
                Join as School
              </Link>
            </motion.div>

            {/* Parent Card (highlighted) */}
            <motion.div variants={fadeUp} custom={1} className="relative rounded-xl border-2 border-brand-500 bg-white p-6 shadow-elevated">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="font-display text-base font-semibold text-gray-900">For Parents</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-brand-600">TSh 100-500</span>
                <span className="text-sm text-gray-500">/form</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Pay only for the forms you submit. Prices vary by school demand.
              </p>
              <ul className="mt-4 space-y-2">
                {['Universal QR Passport', 'Document Vault', 'School Matching', 'Application Tracking'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-6 block w-full text-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Vendor Card */}
            <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
              <h3 className="font-display text-base font-semibold text-gray-900">For Vendors</h3>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold text-vendor-600">FREE</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Earn commission on every payment processed. No signup cost.
              </p>
              <ul className="mt-4 space-y-2">
                {['Payment Terminal', 'Ticket Printing', 'Earnings Dashboard', 'Token Rewards'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-vendor-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/vendor/login"
                className="mt-6 block w-full text-center rounded-lg bg-vendor-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-vendor-600 transition-colors"
              >
                Become Vendor
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-20" ref={faqRef}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="mb-10 text-center"
          >
            <motion.span variants={fadeUp} custom={0} className="text-xs font-bold tracking-[0.15em] text-brand-500 uppercase">
              FREQUENTLY ASKED QUESTIONS
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              Got Questions? We&apos;ve Got Answers.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 py-16 lg:py-20" ref={ctaRef}>
        {/* QR code pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='0' y='0' width='10' height='10'/%3E%3Crect x='20' y='0' width='10' height='10'/%3E%3Crect x='10' y='10' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='30' y='20' width='10' height='10'/%3E%3Crect x='10' y='30' width='10' height='10'/%3E%3Crect x='20' y='30' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          initial="hidden"
          animate={ctaInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-display text-2xl font-bold text-white sm:text-3xl lg:text-[40px] leading-tight"
          >
            Ready to Simplify School Admissions?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mx-auto mt-4 max-w-[600px] text-lg text-white/80"
          >
            Join 50,000+ parents who trust EduResult Pro for their child&apos;s education journey.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-transform duration-150"
            >
              Create Your Free Passport
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/60"
          >
            <CheckCircle className="h-4 w-4" />
            Takes less than 5 minutes
          </motion.p>
        </motion.div>
      </section>
    </Layout>
  );
};

export default LandingPage;
