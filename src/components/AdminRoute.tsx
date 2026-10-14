import { Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, User, LogOut, Menu, X, Banknote, MessageSquare, Inbox, Newspaper, ScrollText, Download, ShieldAlert } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useSiteSettings } from '../context/SettingsContext';
import TwoFactorPanel from './TwoFactorPanel';
import PageLoader from './PageLoader';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, logout, user, token, login } = useAuth();
  const { settings } = useSiteSettings();
  // Profil et permissions relus à chaque ouverture : un changement de rôle s'applique sans reconnexion.
  useEffect(() => {
    if (!token || !isAdmin) return;
    fetch(`${API_URL}/auth/me`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (me && user) login({ ...user, role: me.role, adminRole: me.adminRole, permissions: me.permissions, twoFactorEnabled: me.twoFactorEnabled }, token);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const permissions = user?.permissions ?? [];
  const allMenuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: t('admin.nav.overview'), permission: 'dashboard' },
    { path: '/admin/investments', icon: <Banknote size={20} />, label: t('admin.nav.investments'), permission: 'investments' },
    { path: '/admin/projects', icon: <LayoutDashboard size={20} />, label: t('admin.nav.projects'), permission: 'projects' },
    { path: '/admin/users', icon: <Users size={20} />, label: t('admin.nav.users'), permission: 'users' },
    { path: '/admin/leads', icon: <Inbox size={20} />, label: t('admin.nav.leads'), permission: 'leads' },
    { path: '/admin/posts', icon: <Newspaper size={20} />, label: t('admin.nav.posts'), permission: 'posts' },
    { path: '/admin/support', icon: <MessageSquare size={20} />, label: t('admin.nav.support'), permission: 'support' },
    { path: '/admin/exports', icon: <Download size={20} />, label: t('admin.nav.exports'), permission: 'exports' },
    { path: '/admin/audit', icon: <ScrollText size={20} />, label: t('admin.nav.audit'), permission: 'audit' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: t('admin.nav.settings'), permission: 'settings' },
    { path: '/admin/profile', icon: <User size={20} />, label: t('admin.nav.profile'), permission: null },
  ];
  // Anciennes sessions sans liste de permissions : menu complet (l'API refuse de toute façon ce qui n'est pas permis).
  const menuItems = allMenuItems.filter((item) => !item.permission || !user?.permissions || permissions.includes(item.permission));
  // Page demandée hors du profil : écran d'accès refusé plutôt qu'une page vide d'erreurs.
  const current = [...allMenuItems].sort((a, b) => b.path.length - a.path.length).find((item) => item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path));
  const forbidden = !!user?.permissions && !!current?.permission && !permissions.includes(current.permission);
  const needsTwoFactor = settings.adminTwoFactorRequired && user?.twoFactorEnabled === false;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: 'transparent', position: 'relative' }}>

      {/* Overlay for mobile */}
      <div
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary-900)', margin: 0 }}>Administration</h2>
          {/* Close button for mobile inside sidebar */}
          <button className="admin-menu-toggle" onClick={closeSidebar} style={{ marginBottom: 0, padding: 0 }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive(item.path) ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                backgroundColor: isActive(item.path) ? 'var(--color-primary-50)' : 'transparent',
                fontWeight: isActive(item.path) ? '600' : '500',
                transition: 'all 0.2s'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--color-neutral-200)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <button className="admin-menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} /> <span>Menu</span>
        </button>
        {needsTwoFactor ? (
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ color: 'var(--color-primary-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={26} /> {t('twoFactor.requiredTitle')}</h1>
            <p style={{ color: 'var(--color-neutral-600)' }}>{t('twoFactor.requiredText')}</p>
            <TwoFactorPanel />
          </div>
        ) : forbidden ? (
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ color: 'var(--color-primary-900)' }}>{t('admin.forbiddenTitle')}</h1>
            <p style={{ color: 'var(--color-neutral-600)' }}>{t('admin.forbiddenText', { role: t(`adminRoles.${user?.adminRole ?? 'SUPER_ADMIN'}`) })}</p>
          </div>
        ) : (
          // Repli local : le menu reste affiché pendant le chargement d'une page du back-office.
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default AdminRoute;
