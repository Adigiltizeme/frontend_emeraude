import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, authHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface AdminStatus {
  enabled: boolean;
  blockAllAdmins: boolean;
  stripeConfigured: boolean;
  webhookConfigured: boolean;
  targetFound: boolean;
  blocked: boolean;
  target: { email: string; firstName: string | null; lastName: string | null; billingStatus: string | null; billingPaidAt: string | null; billingPeriodEnd: string | null; billingTourDoneAt: string | null } | null;
}

/** Suivi du paiement d'accès (administrateurs du paiement) : configuration technique et état du compte désigné. */
const BillingAdminPanel = ({ refreshKey }: { refreshKey: number }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<AdminStatus | null>(null);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    fetch(`${API_URL}/billing/admin`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [token]);
  useEffect(() => { load(); }, [load, refreshKey]);

  // Nouveau tarif, passage à l'abonnement… : l'accès du compte désigné est de nouveau soumis au paiement.
  const reset = async () => {
    if (!window.confirm(t('billingAdmin.resetConfirm'))) return;
    setResetting(true);
    const res = await fetch(`${API_URL}/billing/admin/reset`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
    setResetting(false);
    setMessage(res?.ok ? t('billingAdmin.resetDone') : t('billingAdmin.resetError'));
    if (res?.ok) setData(await res.json());
  };

  if (!data) return null;
  const date = (v: string | null) => (v ? new Date(v).toLocaleDateString(i18n.language) : '—');
  const row = (ok: boolean, text: string) => (
    <li style={{ color: ok ? '#166534' : '#b45309' }}>{ok ? '✔' : '⚠'} {text}</li>
  );

  return (
    <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
      <strong>{t('billingAdmin.title')}</strong>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', lineHeight: 1.8, fontSize: '0.92rem' }}>
        {row(data.stripeConfigured, t(data.stripeConfigured ? 'billingAdmin.stripeOk' : 'billingAdmin.stripeMissing'))}
        {row(data.webhookConfigured, t(data.webhookConfigured ? 'billingAdmin.webhookOk' : 'billingAdmin.webhookMissing'))}
        {row(data.targetFound, data.target ? t('billingAdmin.target', { email: data.target.email }) : t('billingAdmin.targetMissing'))}
        <li style={{ color: 'var(--color-neutral-700)' }}>{t(data.blockAllAdmins ? 'billingAdmin.blockAll' : 'billingAdmin.blockTargetOnly')}</li>
        {data.target && (
          <li style={{ color: 'var(--color-neutral-700)' }}>
            {!data.enabled ? t('billingAdmin.disabled') : data.blocked ? t('billingAdmin.blocked') : t('billingAdmin.open')}
            {' · '}{t('billingAdmin.status', { status: data.target.billingStatus ? t(`billingAdmin.statuses.${data.target.billingStatus}`, { defaultValue: data.target.billingStatus }) : t('billingAdmin.statuses.NONE') })}
            {data.target.billingPaidAt && ` · ${t('billingAdmin.paidAt', { date: date(data.target.billingPaidAt) })}`}
            {data.target.billingPeriodEnd && ` · ${t('billingAdmin.periodEnd', { date: date(data.target.billingPeriodEnd) })}`}
            {` · ${t(data.target.billingTourDoneAt ? 'billingAdmin.tourDone' : 'billingAdmin.tourPending')}`}
          </li>
        )}
      </ul>
      {data.target && (data.target.billingStatus || data.target.billingPaidAt) && (
        <button type="button" className="btn btn-outline" onClick={reset} disabled={resetting} style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>
          {t('billingAdmin.reset')}
        </button>
      )}
      {message && <p role="status" style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--color-neutral-700)' }}>{message}</p>}
    </div>
  );
};

export default BillingAdminPanel;
