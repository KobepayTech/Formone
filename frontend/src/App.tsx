import { Routes, Route } from 'react-router'
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<ParentRegisterPage />} />
      <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
      <Route path="/parent/schools" element={<SchoolDiscoveryPage />} />
      <Route path="/parent/cart" element={<FormCartPage />} />
      <Route path="/parent/tickets" element={<ParentTicketWalletPage />} />
      <Route path="/parent/documents" element={<DocumentVaultPage />} />
      <Route path="/vendor/login" element={<VendorLoginPage />} />
      <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
      <Route path="/vendor/payments" element={<VendorPaymentTerminalPage />} />
      <Route path="/vendor/tickets" element={<VendorTicketPrintingPage />} />
      <Route path="/school/login" element={<SchoolLoginPage />} />
      <Route path="/school/applicants" element={<SchoolApplicantsPage />} />
      <Route path="/school/interviews" element={<SchoolInterviewManagerPage />} />
      <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
      <Route path="/admin/schools" element={<PlatformSchoolsPage />} />
      <Route path="/admin/vendors" element={<PlatformVendorsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}
