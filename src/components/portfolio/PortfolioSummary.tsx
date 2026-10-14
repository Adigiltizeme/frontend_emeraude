import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, Download, Landmark, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SettingsContext';
import { compactFieldStyle } from '../../config/formStyles';
import { downloadAnnualStatement } from '../../lib/annualStatement';
import type { Portfolio } from '../../hooks/usePortfolio';

/** Synthèse du portefeuille : capital investi, revenus, remboursements, versements à venir, relevé annuel. */
const PortfolioSummary = ({ portfolio }: { portfolio: Portfolio }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const currentYear = new Date().getUTCFullYear();
  const [year, setYear] = useState(currentYear);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const money = (v: number) => formatMoney(v, i18n.language);
  const s = portfolio.summary;

  const cards = [
    { key: 'investedActive', value: money(s.investedActive), hint: t('portfolio.summary.activeProjects', { count: s.activeCount }), icon: <Wallet size={22} /> },
    { key: 'incomeReceived', value: money(s.incomeReceived), icon: <TrendingUp size={22} /> },
    { key: 'capitalRepaid', value: money(s.capitalRepaid), hint: t('portfolio.summary.closedProjects', { count: s.closedCount }), icon: <PiggyBank size={22} /> },
    { key: 'upcoming', value: money(s.upcoming), icon: <CalendarClock size={22} /> },
  ];

  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/portfolio/statement?year=${year}`, { headers: authHeaders(token) });
      if (!res.ok) throw new Error();
      downloadAnnualStatement(await res.json(), t, i18n.language, settings.legalCompanyName);
    } catch {
      setError(t('portfolio.statement.error'));
    } finally {
      setDownloading(false);
    }
  };

  // Années proposées : de la première opération à l'année en cours.
  const firstYear = portfolio.transactions.length
    ? Math.min(...portfolio.transactions.map((tr) => new Date(tr.date).getUTCFullYear()))
    : currentYear;
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) => currentYear - i);
  const holdsInvestments = portfolio.positions.some((p) => p.invested > 0);

  return (
    <section aria-labelledby="portfolio-title" style={{ marginBottom: '2rem' }}>
      <h3 id="portfolio-title" style={{ margin: '0 0 1rem', color: 'var(--color-neutral-800)', fontSize: '1.25rem' }}>{t('portfolio.title')}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem' }}>
        {cards.map((c) => (
          <div key={c.key} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-neutral-200)', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)' }}>
              {c.icon}
              <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>{t(`portfolio.summary.${c.key}`)}</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-900)', marginTop: '0.4rem' }}>{c.value}</div>
            {c.hint && <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>{c.hint}</div>}
          </div>
        ))}
      </div>

      {portfolio.upcoming.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '1rem 0 0', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9rem' }}>
          {portfolio.upcoming.map((u, i) => (
            <li key={i} style={{ padding: '0.15rem 0' }}>
              {t(u.type === 'CAPITAL' ? 'portfolio.upcomingCapital' : 'portfolio.upcomingIncome', {
                amount: money(u.amount),
                project: u.project,
                period: u.period ? ` (${u.period})` : '',
                date: u.scheduledAt ? new Date(u.scheduledAt).toLocaleDateString(i18n.language) : t('portfolio.dateTbd'),
              })}
            </li>
          ))}
        </ul>
      )}

      {holdsInvestments && !portfolio.hasPayoutAccount && (
        <div role="status" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.9rem' }}>
          <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Landmark size={18} /> {t('portfolio.payoutMissing')}</span>
          <Link to="/mon-profil#versements" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>{t('portfolio.payoutCta')}</Link>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <label htmlFor="statement-year" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{t('portfolio.statement.label')}</label>
        <select id="statement-year" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ ...compactFieldStyle, width: 'auto' }}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="button" onClick={download} disabled={downloading} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
          <Download size={16} /> {downloading ? t('portfolio.statement.downloading') : t('portfolio.statement.download')}
        </button>
        {error && <span role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{error}</span>}
      </div>
    </section>
  );
};

export default PortfolioSummary;
