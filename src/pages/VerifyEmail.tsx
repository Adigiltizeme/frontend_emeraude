import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_URL } from '../config/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { EMAIL_VERIFIED_EVENT } from '../components/EmailVerificationBanner';

/** Page ouverte depuis le lien de l'e-mail de confirmation. */
const VerifyEmail = () => {
  const { t } = useTranslation();
  usePageMeta(t('emailVerification.pageTitle'));
  const [params] = useSearchParams();
  const [state, setState] = useState<'pending' | 'success' | 'error'>('pending');
  const done = useRef(false);

  useEffect(() => {
    // Un seul appel, même si React rejoue l'effet en développement (le jeton est à usage unique).
    if (done.current) return;
    done.current = true;
    const token = params.get('token');
    if (!token) {
      setState('error');
      return;
    }
    fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        setState(res.ok ? 'success' : 'error');
        if (res.ok) window.dispatchEvent(new Event(EMAIL_VERIFIED_EVENT));
      })
      .catch(() => setState('error'));
  }, [params]);

  const icon = state === 'success' ? <CheckCircle size={48} color="#16a34a" /> : state === 'error' ? <XCircle size={48} color="#dc2626" /> : <Clock size={48} color="var(--color-primary-600)" />;
  const text = state === 'success' ? t('emailVerification.success') : state === 'error' ? t('emailVerification.error') : t('emailVerification.verifying');

  return (
    <div style={{ maxWidth: '520px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{icon}</div>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{t('emailVerification.pageTitle')}</h1>
      <p style={{ color: '#475569', marginBottom: '1.5rem' }} role="status">{text}</p>
      {state !== 'pending' && <Link to="/mon-compte" className="btn btn-primary">{t('emailVerification.toDashboard')}</Link>}
    </div>
  );
};

export default VerifyEmail;
