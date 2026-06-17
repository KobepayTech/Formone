import { Routes, Route } from 'react-router'
import RequireAuth from './components/RequireAuth'
import LandingPage from './pages/LandingPage'
import ParentRegisterPage from './pages/ParentRegisterPage'
import ParentDashboardPage from './pages/ParentDashboardPage'
import SchoolDiscoveryPage from './pages/SchoolDiscoveryPage'
import FormCartPage from './pages/FormCartPage'
import ParentTicketWalletPage from './pages/ParentTicketWalletPage'
import DocumentVaultPage from './pages/DocumentVaultPage'
import VendorLoginPage from './pages/VendorLoginPage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import VendorPaymentTerminalPage from './pages/VendorPaymentTerminalPage'
import VendorTicketPrintingPage from './pages/VendorTicketPrintingPage'
import SchoolLoginPage from './pages/SchoolLoginPage'
import SchoolApplicantsPage from './pages/SchoolApplicantsPage'
import SchoolInterviewManagerPage from './pages/SchoolInterviewManagerPage'
import PlatformAnalyticsPage from './pages/PlatformAnalyticsPage'
import PlatformSchoolsPage from './pages/PlatformSchoolsPage'
import PlatformVendorsPage from './pages/PlatformVendorsPage'
import SettingsPage from './pages/SettingsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<ParentRegisterPage />} />
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/school/login" element={<SchoolLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Parent portal */}
      <Route path="/parent/dashboard" element={<RequireAuth roles={['parent']}><ParentDashboardPage /></RequireAuth>} />
      <Route path="/parent/schools" element={<RequireAuth roles={['parent']}><SchoolDiscoveryPage /></RequireAuth>} />
      <Route path="/parent/cart" element={<RequireAuth roles={['parent']}><FormCartPage /></RequireAuth>} />
      <Route path="/parent/tickets" element={<RequireAuth roles={['parent']}><ParentTicketWalletPage /></RequireAuth>} />
      <Route path="/parent/documents" element={<RequireAuth roles={['parent']}><DocumentVaultPage /></RequireAuth>} />

      {/* Vendor portal */}
      <Route path="/vendor/dashboard" element={<RequireAuth roles={['vendor']}><VendorDashboardPage /></RequireAuth>} />
      <Route path="/vendor/payments" element={<RequireAuth roles={['vendor']}><VendorPaymentTerminalPage /></RequireAuth>} />
      <Route path="/vendor/tickets" element={<RequireAuth roles={['vendor']}><VendorTicketPrintingPage /></RequireAuth>} />

      {/* School portal */}
      <Route path="/school/applicants" element={<RequireAuth roles={['school_admin']}><SchoolApplicantsPage /></RequireAuth>} />
      <Route path="/school/interviews" element={<RequireAuth roles={['school_admin']}><SchoolInterviewManagerPage /></RequireAuth>} />

      {/* Platform admin */}
      <Route path="/admin/analytics" element={<RequireAuth roles={['platform_admin']}><PlatformAnalyticsPage /></RequireAuth>} />
      <Route path="/admin/schools" element={<RequireAuth roles={['platform_admin']}><PlatformSchoolsPage /></RequireAuth>} />
      <Route path="/admin/vendors" element={<RequireAuth roles={['platform_admin']}><PlatformVendorsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth roles={['platform_admin']}><SettingsPage /></RequireAuth>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
