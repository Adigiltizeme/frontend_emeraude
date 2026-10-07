import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';

/**
 * Page du prestataire fictif (développement uniquement : l'API renvoie 404 en production).
 * L'issue choisie est enregistrée côté serveur, puis le flux normal de vérification s'applique.
 */
const SimulatePayment = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const reference = params.get('ref') || '';

  const complete = async (outcome: 'SUCCEEDED' | 'FAILED' | 'CANCELLED') => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/payments/sandbox/${encodeURIComponent(reference)}/complete`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome }),
      });
    } finally {
      navigate(`/paiement/retour?ref=${encodeURIComponent(reference)}`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <ShieldAlert size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
      <h1 style={{ color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>{t('payment.sandbox.title')}</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>{t('payment.sandbox.desc')}</p>
      <p style={{ marginBottom: '2rem' }}><strong>{t('payment.sandbox.reference')} :</strong> {reference}</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => complete('CANCELLED')} className="btn btn-outline" disabled={loading}>{t('payment.sandbox.cancel')}</button>
        <button onClick={() => complete('FAILED')} className="btn btn-outline" disabled={loading}>{t('payment.sandbox.failure')}</button>
        <button onClick={() => complete('SUCCEEDED')} className="btn btn-primary" disabled={loading}>{t('payment.sandbox.success')}</button>
      </div>
    </div>
  );
};

export default SimulatePayment;
