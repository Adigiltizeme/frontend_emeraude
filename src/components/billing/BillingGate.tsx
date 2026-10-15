import { Component, createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, Landmark, LogOut, PlayCircle, Settings2 } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import PageLoader from '../PageLoader';
import GuidedTour from './GuidedTour';
import { TourDemoData, loadTourDemoData, startTourDemo } from './tourDemo';

export interface BillingStatus {
  required: boolean;
  concerned: boolean;
  status: string | null;
  tourDone: boolean;
  canManage: boolean;
  periodEnd?: string | null;
  message?: string;
  amount?: number;
  currency?: string;
  mode?: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  methods?: string[];
  productName?: string;
  tourEnabled?: boolean;
}

const BillingContext = createContext<{ status: BillingStatus | null; refresh: () => Promise<void> }>({ status: null, refresh: async () => {} });
export const useBilling = () => useContext(BillingContext);

/**
 * Paiement d'accès : si le compte connecté est désigné et n'a pas encore payé, l'application est remplacée par
 * la visite guidée puis l'invitation à payer (les autres administrateurs voient un écran d'attente si le réglage
 * les bloque aussi). Le serveur refuse de toute façon le reste (BILLING_REQUIRED).
 */
export const BillingGate = ({ children }: { children: ReactNode }) => {
  const { token, user, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  // Visite guidée en direct : vrais écrans alimentés par les données de démonstration (jamais par l'API réelle).
  const [touring, setTouring] = useState(false);
  const [demo, setDemo] = useState<TourDemoData | null>(null);
  const autoStarted = useRef(false);
  // Jeton dont l'état a été chargé : évite d'afficher l'application un instant avant l'écran de paiement.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) { setStatus(null); setLoadedFor(null); autoStarted.current = false; return; }
    const res = await fetch(`${API_URL}/billing/status`, { headers: authHeaders(token) }).catch(() => null);
    const next: BillingStatus | null = res?.ok ? await res.json() : null;
    // Visite activée : première chose affichée à chaque connexion ou rechargement (même rendu que l'état : pas
    // d'écran de paiement entrevu avant la visite).
    if (next?.required && next.concerned && next.tourEnabled && !autoStarted.current) {
      autoStarted.current = true;
      setTouring(true);
    }
    setStatus(next);
    setLoadedFor(token);
  }, [token]);
  useEffect(() => { refresh(); }, [refresh]);
  // Paiement activé ou réglé ailleurs (réglages, webhook, autre appareil) : pris en compte au retour sur l'onglet et chaque minute.
  useLiveRefresh(refresh, 60_000, !!token && !touring);

  // Mode démonstration actif seulement pendant la visite ; les écrans ne sont affichés qu'une fois les données prêtes.
  useEffect(() => {
    if (!touring) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    loadTourDemoData().then((data) => {
      if (cancelled) return;
      stop = startTourDemo(data, { id: user?.id, email: user?.email, firstName: user?.firstName, lastName: user?.lastName, role: user?.role });
      setDemo(data);
    }).catch(() => { if (!cancelled) setTouring(false); });
    return () => { cancelled = true; stop?.(); setDemo(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touring]);

  // Visite terminée (dernière étape) ou passée (possible seulement après une première visite complète).
  const finishTour = async (completed: boolean) => {
    setTouring(false);
    navigate(isAdmin ? '/admin' : '/mon-compte', { replace: true });
    if (completed && !status?.tourDone) {
      await fetch(`${API_URL}/billing/tour-done`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
      await refresh();
    }
  };

  if (token && loadedFor !== token) return <PageLoader />;
  // Retour de la page de paiement : traité par sa propre page (confirmation auprès de Stripe).
  const blocked = !!status?.required && !pathname.startsWith('/facturation/retour');
  let content: ReactNode = children;
  if (blocked && touring) {
    content = demo ? (
      <>
        <TourErrorBoundary key={pathname}>{children}</TourErrorBoundary>
        <GuidedTour routes={demo.__routes} isAdmin={isAdmin} mandatory={!status?.tourDone} onFinish={finishTour} />
      </>
    ) : <PageLoader />;
  } else if (blocked) {
    content = <BillingScreen status={status!} refresh={refresh} onReplay={() => setTouring(true)} />;
  }
  return <BillingContext.Provider value={{ status, refresh }}>{content}</BillingContext.Provider>;
};

/** Écran de démonstration en erreur : la visite continue (étape suivante) au lieu d'une page blanche. */
class TourErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div style={{ minHeight: '60vh' }} /> : this.props.children; }
}

const notice = (bg: string, border: string, color: string) => ({ backgroundColor: bg, border: `1px solid ${border}`, color, padding: '0.75rem 1rem', borderRadius: '8px' });

const BillingScreen = ({ status, refresh, onReplay }: { status: BillingStatus; refresh: () => Promise<void>; onReplay: () => void }) => {
  const { t, i18n } = useTranslation();
  const { token, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Paiement (ou facture impayée d'un abonnement) puis portail de gestion : pages Stripe.
  const redirect = async (path: 'checkout' | 'portal') => {
    setBusy(true);
    setError('');
    const res = await fetch(`${API_URL}/billing/${path}`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok && data?.url) { window.location.href = data.url; return; }
    setError(res?.status === 503 ? t('billing.unavailable') : res?.status === 409 ? t('billing.processing') : t('billing.error'));
    setBusy(false);
    if (res?.status === 400 || res?.status === 409) await refresh();
  };

  const signOut = () => { logout(); window.location.href = '/'; };
  const backdrop = { position: 'fixed' as const, inset: 0, zIndex: 20000, overflowY: 'auto' as const, display: 'flex', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(160deg, var(--color-primary-900) 0%, #0f172a 100%)' };
  const card = { width: 'min(620px, 100%)', margin: 'auto 0', backgroundColor: 'white', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', padding: 'clamp(1.25rem, 4vw, 2.5rem)' };
  const logoutButton = (
    <button type="button" className="btn btn-outline" onClick={signOut} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}><LogOut size={16} /> {t('nav.logout')}</button>
  );

  // Autre administrateur, bloqué tant que le compte désigné n'a pas réglé l'accès : aucune action de paiement.
  if (!status.concerned) {
    return (
      <div style={backdrop}>
        <div role="dialog" aria-modal="true" aria-labelledby="billing-title" style={card}>
          <h1 id="billing-title" style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: 'var(--color-primary-900)' }}>{t('billing.waiting.title')}</h1>
          <p style={{ lineHeight: 1.7, color: 'var(--color-neutral-700)', margin: '0 0 1.5rem' }}>{t('billing.waiting.text')}</p>
          <div style={{ display: 'flex' }}>{logoutButton}</div>
        </div>
      </div>
    );
  }

  const amount = status.amount && status.currency ? formatMoney(status.amount, i18n.language, status.currency) : '';
  const processing = status.status === 'PROCESSING';

  return (
    <div style={backdrop}>
      <div role="dialog" aria-modal="true" aria-labelledby="billing-title" style={card}>
        <h1 id="billing-title" style={{ margin: '0 0 1rem', fontSize: '1.6rem', color: 'var(--color-primary-900)' }}>{status.productName || t('billing.title')}</h1>
        {status.message && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--color-neutral-800)', fontSize: '1.05rem', margin: '0 0 1.5rem' }}>{status.message}</p>}

        {amount && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200, #a7f3d0)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-900)' }}>
              {amount}
              {status.mode && status.mode !== 'ONE_TIME' && <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}> {t(`billing.per.${status.mode}`)}</span>}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--color-neutral-600)' }}>
              {status.methods?.includes('card') && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CreditCard size={16} /> {t('billing.methods.card')}</span>}
              {status.methods?.includes('sepa_debit') && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Landmark size={16} /> {t('billing.methods.sepa_debit')}</span>}
            </div>
          </div>
        )}

        {processing && <p role="status" style={notice('#fffbeb', '#fde68a', '#92400e')}>{t('billing.processing')}</p>}
        {status.status === 'PAST_DUE' && <p role="status" style={notice('#fef2f2', '#fecaca', '#991b1b')}>{t('billing.pastDue')}</p>}
        {status.status === 'FAILED' && <p role="status" style={notice('#fef2f2', '#fecaca', '#991b1b')}>{t('billing.failed')}</p>}
        {error && <p role="alert" style={notice('#fef2f2', '#fecaca', '#b91c1c')}>{error}</p>}

        <button type="button" className="btn btn-primary" onClick={() => redirect('checkout')} disabled={busy || processing} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
          {busy ? t('billing.redirecting') : t('billing.pay')}
        </button>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', textAlign: 'center', margin: '0.6rem 0 1.25rem' }}>{t('billing.secure')}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          {status.tourEnabled && (
            <button type="button" className="btn btn-outline" onClick={onReplay} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><PlayCircle size={16} /> {t('billing.replayTour')}</button>
          )}
          {status.canManage && (
            <button type="button" className="btn btn-outline" onClick={() => redirect('portal')} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Settings2 size={16} /> {t('billing.manage')}</button>
          )}
          {logoutButton}
        </div>
      </div>
    </div>
  );
};
