import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const isAdmin = token && user?.role === 'ADMIN';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Emeraude Africa</Link>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/comment-ca-marche">{t('nav.howItWorks')}</Link>
        <Link to="/investir">{t('nav.invest')}</Link>
        <Link to="/financer">{t('nav.finance')}</Link>

        {!token && (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', textDecoration: 'none', color: 'white' }}>
            Espace Utilisateur
          </Link>
        )}

        {token && user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '600', 
                backgroundColor: 'var(--color-primary-50)', 
                color: 'var(--color-primary-900)', 
                padding: '0.5rem 1rem', 
                borderRadius: '999px', 
                border: '1px solid var(--color-primary-200)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <User size={18} />
              {user.firstName || 'Mon Compte'}
              <ChevronDown size={16} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isDropdownOpen && (
              <div style={{ 
                position: 'absolute', 
                top: 'calc(100% + 0.5rem)', 
                right: 0, 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--color-neutral-200)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-neutral-100)', backgroundColor: '#f8fafc' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-neutral-800)', fontSize: '0.9rem' }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </p>
                </div>

                <div style={{ padding: '0.5rem' }}>
                  {isAdmin ? (
                    <>
                      <Link to="/admin" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <LayoutDashboard size={16} /> Administration
                      </Link>
                      <Link to="/admin/profile" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <User size={16} /> Profil Admin
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/mon-compte" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <LayoutDashboard size={16} /> Mon Tableau de bord
                      </Link>
                      <Link to="/mon-profil" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <User size={16} /> Modifier mon profil
                      </Link>
                    </>
                  )}
                  
                  <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--color-neutral-100)' }} />
                  
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={toggleLanguage} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
          {i18n.language.toUpperCase()}
        </button>
      </nav>
    </header>
  );
};

export default Header;
