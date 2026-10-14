import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../components/billing/BillingGate';

/** Retour de la page de paiement Stripe : la session est confirmée par l'API (relue chez Stripe), jamais crue sur parole. */
const BillingReturn = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { refresh } = useBilling();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [state, setState] = useState<'checking' | 'paid' | 'processing' | 'cancelled' | 'error'>(params.get('annule') ? 'cancelled' : 'checking');

  useEffect(() => {
    if (!sessionId || !token) { if (!params.get('annule')) setState('error'); return; }
    fetch(`${API_URL}/billing/confirm`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(async (r) => {
        const data = r.ok ? await r.json() : null;
        if (!data) return setState('error');
        setState(data.required ? (data.status === 'PROCESSING' ? 'processing' : 'error') : 'paid');
        await refresh();
      })
      .catch(() => setState('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  const home = user?.role === 'ADMIN' ? '/admin' : '/mon-compte';
  const icon = state === 'paid' ? <CheckCircle size={48} color="#16a34a" /> : state === 'processing' || state === 'checking' ? <Clock size={48} color="#d97706" /> : <XCircle size={48} color="#dc2626" />;

  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 520, backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
        {icon}
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-900)', margin: '1rem 0 0.5rem' }}>{t(`billing.return.${state}.title`)}</h1>
        <p style={{ color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{t(`billing.return.${state}.text`)}</p>
        {state === 'paid' ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(home)}>{t('billing.return.start')}</button>
        ) : state !== 'checking' && (
          <Link to={home} className="btn btn-primary">{t('billing.return.back')}</Link>
        )}
      </div>
    </div>
  );
};

export default BillingReturn;
