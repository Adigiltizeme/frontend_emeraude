import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertTriangle, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';

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
}

const METHOD_ICONS: Record<string, JSX.Element> = {
  MOBILE_MONEY: <Smartphone size={20} />,
  WALLET: <Wallet size={20} />,
  CARD: <CreditCard size={20} />,
  BANK_TRANSFER: <Landmark size={20} />,
};

const InvestModal = ({ project, onClose, onManualSuccess }: Props) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings, refresh: refreshSettings } = useSiteSettings();
  const [options, setOptions] = useState<PaymentOptions | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currency = options?.currency || 'XOF';
  const remaining = Math.max(0, (project.target || 0) - (project.raised || 0));
  const money = (value: number) => formatMoney(value, i18n.language, currency);
  // Frais d'entrée (paramètre du back-office) : calcul identique au serveur, affiché avant confirmation.
  const feePercent = settings.investorFeePercent;
  const feeAmount = amount ? Math.round((amount * feePercent) / 100) : 0;

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) refreshSettings();
        if (res.status === 403 && String(data?.message || '').includes('KYC')) setError(t('payment.errors.kyc'));
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('payment.amountLabel', { currency: currency === 'XOF' ? 'FCFA' : currency })}</label>
          <input
            type="number"
            inputMode="numeric"
            min={project.minTicket}
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Math.floor(Number(e.target.value)))}
            placeholder={t('payment.amountPlaceholder', { min: money(project.minTicket) })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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
            <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('payment.feeLine', { percent: feePercent })}</span><span>{money(feeAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e2e8f0', marginTop: '0.35rem', paddingTop: '0.35rem' }}><span>{t('payment.totalLine')}</span><span>{money(amount + feeAmount)}</span></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{t('payment.riskWarning')}</span>
        </div>

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
          <button onClick={submit} className="btn btn-primary" style={{ flex: '1 1 140px', padding: '0.75rem' }} disabled={submitting || !options}>
            {submitting ? t('payment.processing') : t('payment.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
