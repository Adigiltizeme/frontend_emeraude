import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="logo" style={{ whiteSpace: 'nowrap' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Emeraude Africa</Link>
      </div>
      
      {/* Bouton Menu Mobile (caché sur Desktop) */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{ background: 'none', border: 'none', color: 'var(--color-primary-900)', cursor: 'pointer', display: 'none' }}
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Navigation Desktop */}
      <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
              <span className="user-name-text">{user.firstName || 'Mon Compte'}</span>
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
                minWidth: '220px',
                zIndex: 100,
                overflow: 'hidden',
                border: '1px solid var(--color-neutral-200)'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-neutral-100)', backgroundColor: '#f8fafc' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-neutral-900)' }}>{user?.firstName} {user.lastName}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{user.email}</p>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <Link to={isAdmin ? "/admin" : "/mon-compte"} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', color: 'var(--color-neutral-700)', textDecoration: 'none', borderRadius: '6px' }} onClick={() => setIsDropdownOpen(false)}>
                    <LayoutDashboard size={18} />
                    Tableau de bord
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '6px', fontWeight: '500' }}>
                    <LogOut size={18} />
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={toggleLanguage} 
          style={{ background: 'none', border: '1px solid var(--color-primary-600)', color: 'var(--color-primary-600)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {i18n.language === 'fr' ? 'EN' : 'FR'}
        </button>
      </nav>

      {/* Navigation Mobile (Menu Burger) */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-content">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/comment-ca-marche" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.howItWorks')}</Link>
          <Link to="/investir" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.invest')}</Link>
          <Link to="/financer" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.finance')}</Link>
          
          <div style={{ margin: '1rem 0', borderTop: '1px solid #e2e8f0' }}></div>

          {!token ? (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center', padding: '0.75rem', color: 'white' }}>
              Espace Utilisateur
            </Link>
          ) : (
            <>
              <div style={{ color: 'var(--color-neutral-500)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Connecté en tant que {user?.firstName}</div>
              <Link to={isAdmin ? "/admin" : "/mon-compte"} onClick={() => setIsMobileMenuOpen(false)} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
                <LayoutDashboard size={18} style={{ marginRight: '0.5rem' }}/> Tableau de bord
              </Link>
              <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <LogOut size={18} style={{ marginRight: '0.5rem' }}/> {t('nav.logout')}
              </button>
            </>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} 
              style={{ background: 'none', border: '1px solid var(--color-primary-600)', color: 'var(--color-primary-600)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Changer la langue : {i18n.language === 'fr' ? 'Passer en Anglais' : 'Switch to French'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
