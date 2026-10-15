import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import { useSiteSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '../hooks/usePageMeta';

const Register = () => {
  const { t } = useTranslation();
  usePageMeta(t('register.title'), t('register.subtitle'));
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    intention: 'Investissement',
    referralCode: ''
  });
  const { settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const [referrer, setReferrer] = useState<{ valid: boolean; referrer?: string } | null>(null);

  // Lien de parrainage (?parrain=CODE) : code prérempli puis vérifié.
  useEffect(() => {
    const code = searchParams.get('parrain');
    if (code) setFormData((f) => ({ ...f, referralCode: code.toUpperCase().slice(0, 20) }));
  }, [searchParams]);
  useEffect(() => {
    const code = formData.referralCode.trim();
    if (!settings.referralEnabled || code.length < 4) { setReferrer(null); return; }
    const timer = window.setTimeout(() => {
      fetch(`${API_URL}/referrals/code/${encodeURIComponent(code)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then(setReferrer)
        .catch(() => setReferrer(null));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [formData.referralCode, settings.referralEnabled]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedCGU) {
      setError('Veuillez accepter les CGU et la Politique de Confidentialité.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, referralCode: formData.referralCode.trim() || undefined, acceptedTerms: acceptedCGU })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(' ') : errorData.message || 'Erreur lors de la création du compte');
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
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} style={inputStyle} />
            <small style={{ color: 'var(--color-neutral-600)' }}>{t('register.passwordHint')}</small>
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

          {settings.referralEnabled && (
            <div>
              <label htmlFor="register-referral" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-neutral-800)' }}>{t('register.referralCode')}</label>
              <input id="register-referral" type="text" name="referralCode" autoComplete="off" maxLength={20} value={formData.referralCode} onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })} style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.08em' }} aria-describedby="register-referral-status" />
              <small id="register-referral-status" role="status" style={{ display: 'block', marginTop: '0.3rem', color: referrer?.valid ? '#166534' : referrer ? '#b45309' : 'var(--color-neutral-600)' }}>
                {referrer?.valid ? t('register.referralValid', { name: referrer.referrer }) : referrer ? t('register.referralUnknown') : t('register.referralHint')}
              </small>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={acceptedCGU}
                  onChange={(e) => setAcceptedCGU(e.target.checked)}
                  style={{ marginTop: '0.25rem', width: '1.2rem', height: '1.2rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                  J'accepte les <a href="/cgu-cgv" target="_blank" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>Conditions Générales d'Utilisation (CGU)</a> et j'ai lu la <a href="/politique-confidentialite" target="_blank" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>Politique de Confidentialité</a>.
                </span>
              </label>
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
