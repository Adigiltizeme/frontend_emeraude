import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { fieldStyle } from '../config/formStyles';

interface PaymentOptions {
  currency: string;
  methods: { method: string; providers: { code: string; name: string }[] }[];
  manualTransfer: boolean;
}

interface Props {
  project: { id: string; minTicket: number; target: number; raised?: number };
  onClose: () => void;
  /** Virement : instructions configurées dans le back-office (vide si non renseignées). */
  onManualSuccess: (instructions: string) => void;
  /** Montant prérempli (proposition d'investissement automatique). */
  initialAmount?: number;
}

const METHOD_ICONS: Record<string, JSX.Element> = {
  MOBILE_MONEY: <Smartphone size={20} />,
  WALLET: <Wallet size={20} />,
  CARD: <CreditCard size={20} />,
  BANK_TRANSFER: <Landmark size={20} />,
};

const InvestModal = ({ project, onClose, onManualSuccess, initialAmount }: Props) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings, refresh: refreshSettings } = useSiteSettings();
  const [options, setOptions] = useState<PaymentOptions | null>(null);
  const [amount, setAmount] = useState<number | ''>(initialAmount && initialAmount > 0 ? initialAmount : '');
  const [method, setMethod] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedRiskWarning, setAcceptedRiskWarning] = useState(false);
  const { profile, refresh: refreshProfile } = useInvestorProfile();
  const location = useLocation();
  // Profil investisseur à faire ou à refaire (réglage du back-office) : pas de formulaire avant le test.
  const profileMissing = settings.investorProfileRequired && !!profile && profile.status !== 'VALID';
  const fragile = !!profile?.result?.fragile;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currency = options?.currency || 'XOF';
  const remaining = Math.max(0, (project.target || 0) - (project.raised || 0));
  const money = (value: number) => formatMoney(value, i18n.language, currency);
  // Frais d'entrée (paramètre du back-office) : calcul identique au serveur, affiché avant confirmation.
  const feePercent = settings.investorFeePercent;
  // Parrainage : réduction des frais sur le premier investissement d'un filleul (le serveur fait autorité).
  const [feeDiscount, setFeeDiscount] = useState(0);
  const [discountLoaded, setDiscountLoaded] = useState(false);
  const loadDiscount = useCallback(() => {
    if (!token || !settings.referralEnabled || !(feePercent > 0)) { setFeeDiscount(0); setDiscountLoaded(true); return; }
    setDiscountLoaded(false);
    fetch(`${API_URL}/referrals/me`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setFeeDiscount(typeof data?.feeDiscountPercent === 'number' ? data.feeDiscountPercent : 0))
      .catch(() => setFeeDiscount(0))
      .finally(() => setDiscountLoaded(true));
  }, [token, settings.referralEnabled, feePercent]);
  useEffect(() => { loadDiscount(); }, [loadDiscount]);
  const feeAmount = amount ? Math.round((amount * feePercent * (100 - feeDiscount)) / 10_000) : 0;

  // Les moyens disponibles dépendent du montant (contraintes propres à chaque prestataire) : rechargés après la saisie.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = amount ? `?amount=${amount}` : '';
      fetch(`${API_URL}/payments/options${query}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
        .then((data: PaymentOptions | null) => {
          const opts = data || { currency: 'XOF', methods: [], manualTransfer: true };
          setOptions(opts);
          const available = [...opts.methods.map((m) => m.method), ...(opts.manualTransfer ? ['BANK_TRANSFER'] : [])];
          setMethod((current) => (current && available.includes(current) ? current : available[0] || ''));
        });
    }, amount ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, [amount]);

  const methodChoices = useMemo(() => {
    const online = options?.methods.map((m) => m.method) || [];
    return options?.manualTransfer ? [...online, 'BANK_TRANSFER'] : online;
  }, [options]);

  const providersForMethod = options?.methods.find((m) => m.method === method)?.providers || [];

  const submit = async () => {
    setError('');
    if (fragile && !acceptedRiskWarning) return setError(t('payment.errors.riskWarning'));
    if (!acceptedTerms) return setError(t('payment.errors.terms'));
    if (!amount || amount < project.minTicket) return setError(t('payment.errors.min', { min: money(project.minTicket) }));
    if (project.target > 0 && amount > remaining) return setError(t('payment.errors.max', { max: money(remaining) }));
    if (settings.maxInvestmentAmount > 0 && amount > settings.maxInvestmentAmount) return setError(t('payment.errors.maxAmount', { max: money(settings.maxInvestmentAmount) }));

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/investments`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          amount,
          paymentMethod: method,
          provider: provider || undefined,
          lang: i18n.language?.startsWith('en') ? 'en' : 'fr',
          // Le serveur refuse si les frais ont changé depuis l'affichage de ce total.
          expectedTotal: amount + feeAmount,
          acceptedTerms: true,
          acceptedRiskWarning: fragile ? acceptedRiskWarning : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) { refreshSettings(); loadDiscount(); }
        if (res.status === 403 && String(data?.message || '').startsWith('EMAIL_NOT_VERIFIED')) setError(t('payment.errors.emailNotVerified'));
        else if (res.status === 403 && String(data?.message || '').startsWith('INVESTOR_PROFILE_REQUIRED')) { refreshProfile(); setError(t('payment.errors.profile')); }
        else if (res.status === 400 && String(data?.message || '').startsWith('RISK_WARNING_REQUIRED')) { refreshProfile(); setError(t('payment.errors.riskWarning')); }
        else if (res.status === 403 && String(data?.message || '').includes('KYC')) setError(t('payment.errors.kyc'));
        else setError(Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('payment.errors.generic'));
        setSubmitting(false);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      onManualSuccess(data.instructions || '');
    } catch {
      setError(t('payment.errors.generic'));
      setSubmitting(false);
    }
  };

  const optionStyle = (selected: boolean) => ({
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
    border: selected ? '2px solid var(--color-primary-600)' : '1px solid #cbd5e1',
    backgroundColor: selected ? 'var(--color-primary-50)' : 'white',
  });

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '520px', width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} aria-label={t('payment.cancel')} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>
          &times;
        </button>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-primary-900)', fontSize: '1.5rem' }}>{t('payment.title')}</h3>

        {profileMissing ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
            <ClipboardCheck size={40} color="var(--color-primary-600)" />
            <h4 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.15rem' }}>{t(profile?.status === 'EXPIRED' ? 'payment.profile.expiredTitle' : 'payment.profile.title')}</h4>
            <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>{t('payment.profile.text')}</p>
            <Link to={`/profil-investisseur?retour=${encodeURIComponent(location.pathname)}`} className="btn btn-primary" style={{ display: 'inline-block' }}>{t('payment.profile.cta')}</Link>
          </div>
        ) : (<>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('payment.amountLabel', { currency: currency === 'XOF' ? 'FCFA' : currency })}</label>
          <input
            type="number"
            inputMode="numeric"
            min={project.minTicket}
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Math.floor(Number(e.target.value)))}
            placeholder={t('payment.amountPlaceholder', { min: money(project.minTicket) })}
            style={fieldStyle}
          />
          {project.target > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>{t('payment.remaining', { amount: money(remaining) })}</div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('payment.methodLabel')}</div>
          {!options ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('payment.loadingOptions')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.methods.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', margin: 0 }}>{t('payment.noOnline')}</p>
              )}
              {methodChoices.map((m) => (
                <label key={m} style={optionStyle(method === m)}>
                  <input type="radio" name="method" checked={method === m} onChange={() => { setMethod(m); setProvider(''); }} style={{ marginTop: '0.2rem' }} />
                  <span style={{ color: 'var(--color-primary-700)', marginTop: '0.1rem' }}>{METHOD_ICONS[m]}</span>
                  <span>
                    <strong>{t(`payment.methods.${m}`)}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{t(`payment.methodsDesc.${m}`)}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {providersForMethod.length > 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('payment.providerLabel')}</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} style={fieldStyle}>
              <option value="">{t('payment.providerAuto')}</option>
              {providersForMethod.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {feePercent > 0 && !!amount && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('payment.amountLabel', { currency: currency === 'XOF' ? 'FCFA' : currency })}</span><span>{money(amount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('payment.feeLine', { percent: feePercent })}{feeDiscount > 0 && ` · ${t('payment.referralDiscount', { percent: feeDiscount })}`}</span><span>{money(feeAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e2e8f0', marginTop: '0.35rem', paddingTop: '0.35rem' }}><span>{t('payment.totalLine')}</span><span>{money(amount + feeAmount)}</span></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            {t('payment.riskWarning')}
            {settings.reflectionPeriodDays > 0 && <> {t('payment.reflection', { count: settings.reflectionPeriodDays })}</>}
          </span>
        </div>

        {fragile && (
          <div role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{t('payment.reinforced.title')}</strong>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.1rem' }}>
              {profile?.result?.reasons.map((r) => <li key={r}>{t(`investorProfile.reasons.${r}`)}</li>)}
            </ul>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={acceptedRiskWarning} onChange={(e) => setAcceptedRiskWarning(e.target.checked)} style={{ marginTop: '0.2rem', width: '1.1rem', height: '1.1rem' }} />
              <span>{t('payment.reinforced.accept')}</span>
            </label>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem' }} />
          <span>
            <Trans i18nKey="payment.acceptTerms" components={{ link: <a href="/cgu-cgv" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }} /> }} />
          </span>
        </label>

        {error && <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: '1 1 140px', padding: '0.75rem' }} disabled={submitting}>
            {t('payment.cancel')}
          </button>
          <button onClick={submit} className="btn btn-primary" style={{ flex: '1 1 140px', padding: '0.75rem' }} disabled={submitting || !options || !discountLoaded}>
            {submitting ? t('payment.processing') : t('payment.confirm')}
          </button>
        </div>
        </>)}
      </div>
    </div>
  );
};

export default InvestModal;
