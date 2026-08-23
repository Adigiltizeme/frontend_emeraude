import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Invest from './pages/Invest';
import Finance from './pages/Finance';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import ProjectDetails from './pages/ProjectDetails';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRoute from './components/AdminRoute';
import CreateProject from './pages/admin/CreateProject';
import EditProject from './pages/admin/EditProject';
import Register from './pages/Register';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <header className="navbar">
            <div className="logo">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Emeraude Africa</Link>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/comment-ca-marche">{t('nav.howItWorks')}</Link>
              <Link to="/investir">{t('nav.invest')}</Link>
              <Link to="/financer">{t('nav.finance')}</Link>
              <Link to="/inscription" style={{ fontWeight: 'bold', color: 'var(--color-primary-600)' }}>{t('nav.register')}</Link>
              <button onClick={toggleLanguage} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginLeft: '1rem', fontSize: '0.875rem' }}>
                {i18n.language.toUpperCase()}
              </button>
            </nav>
          </header>

          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/investir" element={<Invest />} />
              <Route path="/projet/:id" element={<ProjectDetails />} />
              <Route path="/financer" element={<Finance />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/comment-ca-marche" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<Legal />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="projects/new" element={<CreateProject />} />
                <Route path="projects/edit/:id" element={<EditProject />} />
              </Route>
            </Routes>
          </main>

          <footer>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>{t('footer.copyright')}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/a-propos">{t('nav.about')}</Link>
                <Link to="/faq">{t('nav.faq')}</Link>
                <Link to="/contact">{t('nav.contact')}</Link>
                <Link to="/mentions-legales">{t('nav.legal')}</Link>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
