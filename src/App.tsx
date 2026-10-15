import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import EmailVerificationBanner from './components/EmailVerificationBanner';

import AdminRoute from './components/AdminRoute';
import NewsletterSignup from './components/NewsletterSignup';
import CookieConsent, { openCookieSettings } from './components/CookieConsent';
import { AnnouncementBanner, SocialLinks, WhatsAppButton } from './components/SiteExtras';
import UserRoute from './components/UserRoute';
import Header from './components/Header';
import InteractiveBackground from './components/InteractiveBackground';
import PageLoader from './components/PageLoader';
import { useLightMode } from './lib/lightMode';
import { BillingGate } from './components/billing/BillingGate';

// Découpage du code : chaque page (espace, back-office, PDF, graphiques…) est téléchargée à sa première visite.
const Invest = lazy(() => import('./pages/Invest'));
const Finance = lazy(() => import('./pages/Finance'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Contact = lazy(() => import('./pages/Contact'));
const LegalNotices = lazy(() => import('./pages/LegalNotices'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const SimulatePayment = lazy(() => import('./pages/SimulatePayment'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));
const WhyEmeraude = lazy(() => import('./pages/WhyEmeraude'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminFaq = lazy(() => import('./pages/admin/AdminFaq'));
const AdminBroadcasts = lazy(() => import('./pages/admin/AdminBroadcasts'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CreateProject = lazy(() => import('./pages/admin/CreateProject'));
const EditProject = lazy(() => import('./pages/admin/EditProject'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const EditUser = lazy(() => import('./pages/admin/EditUser'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSupportPage = lazy(() => import('./pages/admin/AdminSupportPage'));
const AdminInvestments = lazy(() => import('./pages/admin/AdminInvestments'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const Register = lazy(() => import('./pages/Register'));
const BillingReturn = lazy(() => import('./pages/BillingReturn'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const InvestorProfile = lazy(() => import('./pages/InvestorProfile'));
const AdminDistributions = lazy(() => import('./pages/admin/AdminDistributions'));
const OwnerProject = lazy(() => import('./pages/OwnerProject'));
const AdminProjectDossier = lazy(() => import('./pages/admin/AdminProjectDossier'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));
const AdminExports = lazy(() => import('./pages/admin/AdminExports'));

function App() {
  const { t } = useTranslation();
  const [lightMode, setLightMode] = useLightMode();

  
  return (
    <AuthProvider>
      <SocketProvider>
      <SettingsProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BillingGate>
        <div className="app-container">
          {!lightMode && <InteractiveBackground />}
          <AnnouncementBanner />
          <Header />
          <EmailVerificationBanner />

          <main>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verifier-email" element={<VerifyEmail />} />
              <Route path="/facturation/retour" element={<BillingReturn />} />
              
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
                <Route path="faq" element={<AdminFaq />} />
                <Route path="messages" element={<AdminBroadcasts />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="projects/:id/distributions" element={<AdminDistributions />} />
                <Route path="projects/:id/dossier" element={<AdminProjectDossier />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="exports" element={<AdminExports />} />
              </Route>
            </Routes>
            </Suspense>
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
                <button type="button" onClick={() => setLightMode(!lightMode)} aria-pressed={lightMode} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}>
                  {t(lightMode ? 'lightMode.on' : 'lightMode.off')}
                </button>
                {import.meta.env.VITE_GA_MEASUREMENT_ID && (
                  <button type="button" onClick={openCookieSettings} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}>{t('footer.cookies')}</button>
                )}
              </div>
            </div>
          </footer>
          <CookieConsent />
          <WhatsAppButton />
        </div>
        </BillingGate>
      </BrowserRouter>
      </SettingsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
