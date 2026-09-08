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
import AdminDashboard from './pages/admin/Dashboard';
import AdminRoute from './components/AdminRoute';
import CreateProject from './pages/admin/CreateProject';
import EditProject from './pages/admin/EditProject';
import ManageUsers from './pages/admin/ManageUsers';
import EditUser from './pages/admin/EditUser';
import Profile from './pages/admin/Profile';
import AdminSettings from './pages/admin/AdminSettings';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Header from './components/Header';
import InteractiveBackground from './components/InteractiveBackground';

function App() {
  const { t } = useTranslation();

  
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <InteractiveBackground />
          <Header />

          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mon-compte" element={<UserDashboard />} />
              <Route path="/investir" element={<Invest />} />
              <Route path="/projet/:id" element={<ProjectDetails />} />
              <Route path="/financer" element={<Finance />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/comment-ca-marche" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<Legal />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="projects/new" element={<CreateProject />} />
                <Route path="projects/edit/:id" element={<EditProject />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="users/edit/:id" element={<EditUser />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<AdminSettings />} />
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
