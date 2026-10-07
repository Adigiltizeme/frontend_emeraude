import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';

interface PaymentStatus {
  reference: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  provider: string;
  method: string;
  amount: number;
  currency: string;
  checkoutUrl: string | null;
  investment: { id: string; status: string; projectId: string; project: { title: string } } | null;
}

/** Écran de retour après le paiement : suit le statut jusqu'à la confirmation du prestataire. */
const PaymentReturn = () => {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { socket } = useSocket();
  const reference = params.get('ref') || '';
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(() => {
    if (!reference || !token) {
      setNotFound(true);
      return;
    }
    fetch(`${API_URL}/payments/${encodeURIComponent(reference)}`, { headers: authHeaders(token) })
      .then(async (res) => {
        if (res.ok) setPayment(await res.json());
        else if (res.status === 404 || res.status === 401 || res.status === 403) setNotFound(true);
      })
      .catch((err) => console.error(err));
  }, [reference, token]);

  useEffect(() => {
    if (!reference) setNotFound(true);
    load();
  }, [load, reference]);

  const pending = !payment || payment.status === 'PENDING';
  // Statut critique : vérification toutes les 5 s tant que le paiement est en attente.
  useLiveRefresh(load, 5_000, pending && !notFound);

  const investmentId = payment?.investment?.id;
  useEffect(() => {
    if (!socket || !investmentId) return;
    const onUpdate = (data: any) => {
      if (data?.id === investmentId || data?.investmentId === investmentId) load();
    };
    socket.on('investment.updated', onUpdate);
    socket.on('payment.updated', onUpdate);
    return () => {
      socket.off('investment.updated', onUpdate);
      socket.off('payment.updated', onUpdate);
    };
  }, [socket, investmentId, load]);

  const retry = async () => {
    if (!payment?.investment) return;
    setRetrying(true);
    try {
      const res = await fetch(`${API_URL}/payments/investments/${payment.investment.id}/retry`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: payment.method, lang: i18n.language?.startsWith('en') ? 'en' : 'fr' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // Investissement plus en attente (expiré, annulé) : retour à la fiche projet pour un nouvel investissement.
      navigate(`/projet/${payment.investment.projectId}`);
    } finally {
      setRetrying(false);
    }
  };

  const card = (icon: JSX.Element, title: string, desc: string, actions: JSX.Element) => (
    <div style={{ maxWidth: '560px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{icon}</div>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-900)', marginBottom: '0.75rem' }}>{title}</h1>
      <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>{desc}</p>
      {payment && <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>{t('payment.return.reference', { reference: payment.reference })}</p>}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>{actions}</div>
    </div>
  );

  const dashboardBtn = <Link to="/mon-compte" className="btn btn-primary">{t('payment.return.dashboard')}</Link>;

  if (notFound) {
    return card(<XCircle size={48} color="#dc2626" />, t('payment.return.notFound'), '', dashboardBtn);
  }
  if (!payment) {
    return card(<Clock size={48} color="var(--color-primary-600)" />, t('payment.return.loading'), '', <></>);
  }

  const amount = formatMoney(payment.amount, i18n.language, payment.currency);
  const project = payment.investment?.project.title || '';
  const desc = t(`payment.return.${payment.status}_desc`, { provider: payment.provider, amount, project });

  if (payment.status === 'SUCCEEDED') {
    return card(<CheckCircle size={48} color="#16a34a" />, t('payment.return.SUCCEEDED'), desc, dashboardBtn);
  }
  if (payment.status === 'PENDING') {
    return card(
      <Clock size={48} color="var(--color-primary-600)" />,
      t('payment.return.PENDING'),
      desc,
      <>
        {payment.checkoutUrl && <a href={payment.checkoutUrl} className="btn btn-outline">{t('payment.return.resume')}</a>}
        {dashboardBtn}
      </>,
    );
  }
  const canRetry = payment.status !== 'EXPIRED' && payment.investment?.status === 'PENDING';
  return card(
    <XCircle size={48} color="#dc2626" />,
    t(`payment.return.${payment.status}`),
    desc,
    <>
      {canRetry && (
        <button onClick={retry} className="btn btn-primary" disabled={retrying}>
          {t('payment.return.retry')}
        </button>
      )}
      <Link to="/mon-compte" className="btn btn-outline">{t('payment.return.dashboard')}</Link>
    </>,
  );
};

export default PaymentReturn;
