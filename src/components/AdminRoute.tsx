import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, User, LogOut, Menu, X, Banknote } from 'lucide-react';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: "Vue d'ensemble" },
    { path: '/admin/investments', icon: <Banknote size={20} />, label: "Investissements" },
    { path: '/admin/projects', icon: <LayoutDashboard size={20} />, label: "Porteurs de projets" },
    { path: '/admin/users', icon: <Users size={20} />, label: "Utilisateurs" },
    { path: '/admin/profile', icon: <User size={20} />, label: "Mon Profil" },
    { path: '/admin/settings', icon: <Settings size={20} />, label: "Paramètres du site" },
  ];

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
        <Outlet />
      </main>
    </div>
  );
};

export default AdminRoute;
