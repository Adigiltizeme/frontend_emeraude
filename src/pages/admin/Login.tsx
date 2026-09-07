import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        throw new Error('Identifiants incorrects');
      }

      const data = await response.json();
      login(data.user, data.access_token);

      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setError("Vous n'avez pas les droits d'administration.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-neutral-100)' }}>
      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-900)', fontSize: '1.75rem' }}>Espace Administrateur</h2>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.login.password')}</label>
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
      </div>
    </div>
  );
};

export default AdminLogin;
