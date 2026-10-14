import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fieldStyle, labelStyle } from '../config/formStyles';

/** Coordonnées de versement des revenus et remboursements (Mobile Money ou banque). */
const PayoutAccountForm = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [method, setMethod] = useState<'MOBILE_MONEY' | 'BANK_TRANSFER'>('MOBILE_MONEY');
  const [details, setDetails] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/portfolio/payout-account`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.method) setMethod(data.method);
        setDetails(data.details || '');
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => {});
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/portfolio/payout-account`, {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, details, currentPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error(t('payoutAccount.wrongPassword'));
      if (!res.ok) throw new Error(typeof data?.message === 'string' ? data.message : t('payoutAccount.error'));
      setUpdatedAt(data.updatedAt);
      setCurrentPassword('');
      setStatus({ ok: true, text: t('payoutAccount.saved') });
    } catch (err: any) {
      setStatus({ ok: false, text: err?.message || t('payoutAccount.error') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="versements" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--color-neutral-800)', margin: '0 0 0.5rem' }}>
        <Landmark size={22} color="var(--color-primary-600)" /> {t('payoutAccount.title')}
      </h2>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1rem', fontSize: '0.95rem' }}>{t('payoutAccount.intro')}</p>
      <form onSubmit={save} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label htmlFor="payout-method" style={labelStyle}>{t('payoutAccount.method')}</label>
          <select id="payout-method" value={method} onChange={(e) => setMethod(e.target.value as typeof method)} style={fieldStyle}>
            <option value="MOBILE_MONEY">{t('payoutAccount.methods.MOBILE_MONEY')}</option>
            <option value="BANK_TRANSFER">{t('payoutAccount.methods.BANK_TRANSFER')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="payout-details" style={labelStyle}>{t('payoutAccount.details')}</label>
          <textarea id="payout-details" value={details} onChange={(e) => setDetails(e.target.value)} required minLength={6} maxLength={300} rows={3} placeholder={t(`payoutAccount.placeholders.${method}`)} style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label htmlFor="payout-password" style={labelStyle}>{t('payoutAccount.currentPassword')}</label>
          <input id="payout-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={fieldStyle} />
          <small style={{ display: 'block', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>{t('payoutAccount.passwordHint')}</small>
        </div>
        {status && <p role={status.ok ? 'status' : 'alert'} style={{ margin: 0, color: status.ok ? '#166534' : '#b91c1c', fontSize: '0.9rem' }}>{status.text}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={saving || details.trim().length < 6 || !currentPassword}>{saving ? t('payoutAccount.saving') : t('payoutAccount.save')}</button>
          {updatedAt && <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)' }}>{t('payoutAccount.updated', { date: new Date(updatedAt).toLocaleDateString(i18n.language) })}</span>}
        </div>
      </form>
    </section>
  );
};

export default PayoutAccountForm;
