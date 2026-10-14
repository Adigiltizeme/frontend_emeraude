import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { compactFieldStyle } from '../../config/formStyles';

interface Kpis {
  days: number;
  conversion: { registered: number; investors: number; rate: number | null };
  kyc: { users: number; verified: number; rate: number | null };
  invested: { total: number; count: number; period: number; periodCount: number; averageTicket: number | null };
  reinvestment: { investors: number; reinvestors: number; rate: number | null };
  processing: { kycHours: number | null; kycCount: number; projectHours: number | null; projectCount: number; supportHours: number | null; supportCount: number; supportUnanswered: number };
}

/** Indicateurs de succès du cahier des charges (§18) : conversion, KYC, montant investi, réinvestissement, délais. */
const AdminKpis = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [days, setDays] = useState(90);
  const [kpis, setKpis] = useState<Kpis | null>(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/admin/kpis?days=${days}`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setKpis(data))
      .catch(() => {});
  }, [days, token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 60_000);

  if (!kpis) return null;
  const pct = (v: number | null) => (v === null ? '—' : `${v.toLocaleString(i18n.language)} %`);
  const duration = (h: number | null) => (h === null ? '—' : h < 48 ? t('kpis.hours', { count: Math.round(h) }) : t('kpis.days', { count: Math.round(h / 24) }));

  const cards = [
    { title: t('kpis.conversion'), value: pct(kpis.conversion.rate), hint: t('kpis.conversionHint', { investors: kpis.conversion.investors, registered: kpis.conversion.registered }) },
    { title: t('kpis.kyc'), value: pct(kpis.kyc.rate), hint: t('kpis.kycHint', { verified: kpis.kyc.verified, users: kpis.kyc.users }) },
    { title: t('kpis.invested'), value: formatMoney(kpis.invested.period, i18n.language), hint: t('kpis.investedHint', { total: formatMoney(kpis.invested.total, i18n.language), average: kpis.invested.averageTicket ? formatMoney(kpis.invested.averageTicket, i18n.language) : '—' }) },
    { title: t('kpis.reinvestment'), value: pct(kpis.reinvestment.rate), hint: t('kpis.reinvestmentHint', { reinvestors: kpis.reinvestment.reinvestors, investors: kpis.reinvestment.investors }) },
    { title: t('kpis.kycDelay'), value: duration(kpis.processing.kycHours), hint: t('kpis.basedOn', { count: kpis.processing.kycCount }) },
    { title: t('kpis.projectDelay'), value: duration(kpis.processing.projectHours), hint: t('kpis.basedOn', { count: kpis.processing.projectCount }) },
    { title: t('kpis.supportDelay'), value: duration(kpis.processing.supportHours), hint: t('kpis.unanswered', { count: kpis.processing.supportUnanswered }) },
  ];

  return (
    <section aria-labelledby="kpis-title" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h2 id="kpis-title" style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary-900)' }}>{t('kpis.title')}</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          {t('kpis.period')}
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...compactFieldStyle, width: 'auto' }}>
            {[30, 90, 365].map((d) => <option key={d} value={d}>{t('kpis.lastDays', { count: d })}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '0.75rem' }}>
        {cards.map((c) => (
          <div key={c.title} style={{ backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>{c.title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-900)', margin: '0.3rem 0' }}>{c.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{c.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminKpis;
