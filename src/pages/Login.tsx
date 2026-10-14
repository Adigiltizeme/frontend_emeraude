import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config/api';
import { fieldStyle, labelStyle } from '../config/formStyles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
      setInfo('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }, []);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(response.status === 429 ? t('twoFactor.tooMany') : 'Identifiants incorrects');
      }

      const data = await response.json();
      // Double authentification active : deuxième étape avec le code de l'application.
      if (data.twoFactorRequired) {
        setChallenge(data.challenge);
        return;
      }
      finish(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const finish = (data: any) => {
    login(data.user, data.access_token);
    navigate(data.user.role === 'ADMIN' ? '/admin' : '/mon-compte');
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const response = await fetch(`${API_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge, code }),
    }).catch(() => null);
    if (!response?.ok) {
      const data = await response?.json().catch(() => ({}));
      const message = String(data?.message || '');
      setError(
        message.startsWith('TWO_FACTOR_LOCKED') ? t('twoFactor.locked')
          : message.startsWith('TWO_FACTOR_UNREADABLE') ? t('twoFactor.unreadable')
          : response?.status === 429 ? t('twoFactor.tooMany')
          : message === 'Code incorrect.' ? t('twoFactor.wrongCode')
          : t('twoFactor.expired'),
      );
      if (message.startsWith('TWO_FACTOR_LOCKED') || message.startsWith('Session')) setChallenge('');
      setCode('');
      return;
    }
    finish(await response.json());
  };

  if (challenge) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)', padding: '2rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontSize: '1.5rem' }}>{t('twoFactor.loginTitle')}</h2>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-neutral-500)' }}>{t('twoFactor.loginHelp')}</p>
          {error && <div role="alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>{error}</div>}
          <form onSubmit={handleCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label htmlFor="login-code" style={labelStyle}>{t('twoFactor.code')}</label>
            <input id="login-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" inputMode="text" autoFocus required maxLength={20} style={{ ...fieldStyle, letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.25rem' }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem', fontWeight: 'bold' }}>{t('twoFactor.verify')}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setChallenge(''); setCode(''); setError(''); }}>{t('twoFactor.back')}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)', padding: '2rem' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontSize: '1.75rem' }}>Espace Utilisateur</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-neutral-500)' }}>Connectez-vous à votre compte Emeraude Africa</p>

        {info && <div style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #93c5fd' }}>{info}</div>}
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary-600)', textDecoration: 'none' }}>Mot de passe oublié ?</Link>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Se connecter
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
          Pas encore de compte ? <Link to="/inscription" style={{ color: 'var(--color-primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>S'inscrire</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
