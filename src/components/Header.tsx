import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const isAdmin = token && user?.role === 'ADMIN';
  const isUser = token && user?.role === 'USER';

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Emeraude Africa</Link>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/comment-ca-marche">{t('nav.howItWorks')}</Link>
        <Link to="/investir">{t('nav.invest')}</Link>
        <Link to="/financer">{t('nav.finance')}</Link>

        {!token && (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: 'white' }}>
            Espace Utilisateur
          </Link>
        )}


        {isUser && (
          <Link to="/mon-compte" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', backgroundColor: 'var(--color-primary-600)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
            <LayoutDashboard size={18} />
            Mon Compte
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', backgroundColor: 'var(--color-primary-600)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
            <LayoutDashboard size={18} />
            {t('nav.dashboard')}
          </Link>
        )}

        <button onClick={toggleLanguage} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginLeft: '1rem', fontSize: '0.875rem' }}>
          {i18n.language.toUpperCase()}
        </button>
      </nav>
    </header>
  );
};

export default Header;
