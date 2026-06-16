import type { FC } from 'react';
import { Link } from 'react-router';
import { GraduationCap } from 'lucide-react';

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-brand-400" />
              <span className="font-display text-lg font-bold text-white">
                EduResult Pro <span className="text-brand-400 text-sm">v2.0</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your Universal Education Passport. Apply to multiple schools with a single verified profile.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {/* Social Icons */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Parent Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-200 mb-4">
              For Parents
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/register" className="text-sm hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/parent/schools" className="text-sm hover:text-white transition-colors">
                  School Discovery
                </Link>
              </li>
              <li>
                <Link to="/parent/documents" className="text-sm hover:text-white transition-colors">
                  Document Vault
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* School Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-200 mb-4">
              For Schools
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/school/login" className="text-sm hover:text-white transition-colors">
                  Join Network
                </Link>
              </li>
              <li>
                <Link to="/school/login" className="text-sm hover:text-white transition-colors">
                  School Portal
                </Link>
              </li>
              <li>
                <Link to="/school/applicants" className="text-sm hover:text-white transition-colors">
                  Applicant Dashboard
                </Link>
              </li>
              <li>
                <Link to="/school/interviews" className="text-sm hover:text-white transition-colors">
                  Interview Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendor Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-200 mb-4">
              For Vendors
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/vendor/login" className="text-sm hover:text-white transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="text-sm hover:text-white transition-colors">
                  Vendor Portal
                </Link>
              </li>
              <li>
                <Link to="/vendor/payments" className="text-sm hover:text-white transition-colors">
                  Payment Terminal
                </Link>
              </li>
              <li>
                <Link to="/vendor/tickets" className="text-sm hover:text-white transition-colors">
                  Ticket Printing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2025 EduResult Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Security
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Trust Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
