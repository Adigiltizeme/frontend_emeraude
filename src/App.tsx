import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import Invest from './pages/Invest';
import Finance from './pages/Finance';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import LegalNotices from './pages/LegalNotices';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectDetails from './pages/ProjectDetails';
import SimulatePayment from './pages/SimulatePayment';
import PaymentReturn from './pages/PaymentReturn';
import WhyEmeraude from './pages/WhyEmeraude';
import VerifyEmail from './pages/VerifyEmail';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminPosts from './pages/admin/AdminPosts';

import AdminDashboard from './pages/admin/Dashboard';
import AdminRoute from './components/AdminRoute';
import CreateProject from './pages/admin/CreateProject';
import EditProject from './pages/admin/EditProject';
import ManageUsers from './pages/admin/ManageUsers';
import EditUser from './pages/admin/EditUser';
import Profile from './pages/admin/Profile';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminInvestments from './pages/admin/AdminInvestments';
import AdminProjects from './pages/admin/AdminProjects';
import AdminLeads from './pages/admin/AdminLeads';
import NewsletterSignup from './components/NewsletterSignup';
import CookieConsent, { openCookieSettings } from './components/CookieConsent';
import { AnnouncementBanner, SocialLinks, WhatsAppButton } from './components/SiteExtras';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import UserRoute from './components/UserRoute';
import Header from './components/Header';
import InteractiveBackground from './components/InteractiveBackground';
import InvestorProfile from './pages/InvestorProfile';
import AdminDistributions from './pages/admin/AdminDistributions';
import OwnerProject from './pages/OwnerProject';
import AdminProjectDossier from './pages/admin/AdminProjectDossier';
import AdminAudit from './pages/admin/AdminAudit';
import AdminExports from './pages/admin/AdminExports';

function App() {
  const { t } = useTranslation();

  
  return (
    <AuthProvider>
      <SocketProvider>
      <SettingsProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <InteractiveBackground />
          <AnnouncementBanner />
          <Header />
          <EmailVerificationBanner />

          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verifier-email" element={<VerifyEmail />} />
              
              <Route element={<UserRoute />}>
                <Route path="/mon-compte" element={<UserDashboard />} />
                <Route path="/mon-profil" element={<UserProfile />} />
                <Route path="/paiement/retour" element={<PaymentReturn />} />
                <Route path="/profil-investisseur" element={<InvestorProfile />} />
                <Route path="/mon-compte/projets/:id" element={<OwnerProject />} />
              </Route>

              <Route path="/investir" element={<Invest />} />
              <Route path="/projet/:id" element={<ProjectDetails />} />
              <Route path="/simulate-payment" element={<SimulatePayment />} />
              <Route path="/financer" element={<Finance />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/pourquoi-emeraude" element={<WhyEmeraude />} />
              <Route path="/actualites" element={<Blog />} />
              <Route path="/actualites/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/comment-ca-marche" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<LegalNotices />} />
              <Route path="/cgu-cgv" element={<TermsOfUse />} />
              <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
              <Route path="/legal" element={<LegalNotices />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="projects/new" element={<CreateProject />} />
                <Route path="projects/edit/:id" element={<EditProject />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="investments" element={<AdminInvestments />} /><Route path="projects" element={<AdminProjects />} />
                <Route path="users/edit/:id" element={<EditUser />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="support" element={<AdminSupportPage />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="projects/:id/distributions" element={<AdminDistributions />} />
                <Route path="projects/:id/dossier" element={<AdminProjectDossier />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="exports" element={<AdminExports />} />
              </Route>
            </Routes>
          </main>

          <footer>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', textAlign: 'center' }}>
              <NewsletterSignup />
              <SocialLinks />
              <p style={{ width: '100%' }}>{t('footer.copyright')}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <Link to="/a-propos">{t('nav.about')}</Link>
                <Link to="/pourquoi-emeraude">{t('footer.why')}</Link>
                <Link to="/actualites">{t('footer.blog')}</Link>
                <Link to="/faq">{t('nav.faq')}</Link>
                <Link to="/contact">{t('nav.contact')}</Link>
                <Link to="/mentions-legales">{t('footer.legalNotice')}</Link>
                <Link to="/cgu-cgv">{t('footer.terms')}</Link>
                <Link to="/politique-confidentialite">{t('footer.privacy')}</Link>
                {import.meta.env.VITE_GA_MEASUREMENT_ID && (
                  <button type="button" onClick={openCookieSettings} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}>{t('footer.cookies')}</button>
                )}
              </div>
            </div>
          </footer>
          <CookieConsent />
          <WhatsAppButton />
        </div>
      </BrowserRouter>
      </SettingsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
