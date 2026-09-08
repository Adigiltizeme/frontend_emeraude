import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, MessageCircle, Info, CheckCircle } from 'lucide-react';
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
  const [isRegistered, setIsRegistered] = useState(false);

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
      login(data.access_token, data.user);
      setIsRegistered(true);
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
    border: '1px solid #cbd5e1', // Using distinct border color
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    color: '#0f172a'
  };

  if (isRegistered) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <CheckCircle size={64} color="var(--color-primary-600)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ color: 'var(--color-primary-900)', marginBottom: '1rem', fontSize: '2rem' }}>{t('register.successTitle')}</h1>
            <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {t('register.successDesc', { firstName: formData.firstName })}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {t('register.btnHome')}</button>
          </div>

          <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
              <Info size={28} color="var(--color-primary-600)" />
              <h3 style={{ color: 'var(--color-primary-900)', margin: 0, fontSize: '1.5rem' }}>{t('register.readyTitle')}</h3>
            </div>
            <p style={{ color: 'var(--color-neutral-700)', lineHeight: '1.6', marginBottom: '2rem', textAlign: 'center' }}>
              {t('register.readyDesc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="tel:+221770000000" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-neutral-800)', padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                <div style={{ backgroundColor: 'var(--color-primary-100)', padding: '0.75rem', borderRadius: '50%' }}>
                  <Phone size={24} color="var(--color-primary-600)" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>{t('register.call')}</div>
                  <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>+221 77 000 00 00</div>
                </div>
              </a>

              <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-neutral-800)', padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                <div style={{ backgroundColor: '#dcf8c6', padding: '0.75rem', borderRadius: '50%' }}>
                  <MessageCircle size={24} color="#128C7E" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>WhatsApp</div>
                  <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>{t('register.chat')}</div>
                </div>
              </a>

              <a href="mailto:contact@emeraude-invest.com" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-neutral-800)', padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '50%' }}>
                  <Mail size={24} color="#475569" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>{t('register.email')}</div>
                  <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>contact@emeraude-invest.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>

      {/* Formulaire */}
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

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
            {loading ? t('register.loading') : t('register.btnSubmit')}
          </button>
        </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
            Déjà inscrit ? <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>Se connecter</Link>
          </div>

        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-neutral-600)' }}>
          {t('register.hasAccount')} <Link to="/admin/login" style={{ color: 'var(--color-primary-600)', fontWeight: '600' }}>{t('register.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
