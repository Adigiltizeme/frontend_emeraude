import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    intention: 'Investissement'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du compte');
      }

      const data = await response.json();
      login(data.user, data.access_token);
      
      setSuccess(true);
      setTimeout(() => {
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/mon-compte');
        }
      }, 2000); // 2 seconds transition
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    color: '#0f172a'
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ color: 'var(--color-primary-900)', marginBottom: '0.5rem', fontSize: '2rem' }}>{t('register.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginBottom: '2rem' }}>{t('register.subtitle')}</p>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.firstName')}</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.lastName')}</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.phone')}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.intention')}</label>
            <select name="intention" value={formData.intention} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="Investissement">{t('register.intInvest')}</option>
              <option value="Porteur de projet">{t('register.intProject')}</option>
              <option value="Demande de renseignements">{t('register.intInfo')}</option>
              <option value="Autre">{t('register.intOther')}</option>
            </select>
          </div>

          <button type="submit" disabled={loading || success} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', backgroundColor: success ? '#10b981' : undefined, transition: 'all 0.3s ease' }}>
            {success ? 'Inscription réussie ! Redirection...' : loading ? t('register.loading') : t('register.btnSubmit')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
          Déjà inscrit ? <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
