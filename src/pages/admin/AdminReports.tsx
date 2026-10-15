import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SettingsContext';
import { API_URL, authHeaders } from '../../config/api';
import { compactFieldStyle, labelStyle } from '../../config/formStyles';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { MonthlyReport, downloadMonthlyReport, monthLabel, reportSections } from '../../lib/monthlyReport';

/** Douze derniers mois (AAAA-MM, UTC), le plus récent d'abord. */
const lastMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
};

/** Rapport mensuel d'activité : affiché à l'écran et téléchargeable en PDF. */
const AdminReports = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const months = lastMonths();
  const [month, setMonth] = useState(months[0]);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/admin/reports/monthly?month=${month}`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { setReport(data); setError(false); })
      .catch(() => setError(true));
  }, [token, month]);
  useEffect(() => { setReport(null); load(); }, [load]);
  // Statistiques : rafraîchies chaque minute et au retour sur l'onglet (mois en cours).
  useLiveRefresh(load, 60_000);

  const card = { backgroundColor: 'white', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>{t('admin.reports.title')}</h1>
          <p style={{ color: 'var(--color-neutral-600)', margin: '0.4rem 0 0' }}>{t('admin.reports.intro')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="report-month" style={labelStyle}>{t('admin.reports.month')}</label>
            <select id="report-month" name="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...compactFieldStyle, width: 'auto', textTransform: 'capitalize' }}>
              {months.map((m) => <option key={m} value={m}>{monthLabel(m, i18n.language)}</option>)}
            </select>
          </div>
          <button type="button" className="btn btn-primary" disabled={!report} onClick={() => report && downloadMonthlyReport(report, t, i18n.language, settings.legalCompanyName)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} /> {t('admin.reports.download')}
          </button>
        </div>
      </div>

      {error && <p role="alert" style={{ color: '#991b1b' }}>{t('admin.reports.error')}</p>}
      {!report && !error && <p role="status">{t('common.loading')}</p>}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {reportSections(report, t).map((section) => (
            <section key={section.key} aria-labelledby={`report-${section.key}`} style={{ ...card, gridColumn: section.table ? '1 / -1' : undefined }}>
              <h2 id={`report-${section.key}`} style={{ fontSize: '1.1rem', color: 'var(--color-primary-900)', marginTop: 0 }}>{section.title}</h2>
              <dl style={{ display: 'grid', gridTemplateColumns: section.table ? 'repeat(auto-fit, minmax(230px, 1fr))' : '1fr', gap: '0.4rem 1.5rem', margin: 0 }}>
                {section.rows.map(([name, value]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)', padding: '0.35rem 0' }}>
                    <dt style={{ color: 'var(--color-neutral-600)' }}>{name}</dt>
                    <dd style={{ margin: 0, fontWeight: 600, color: 'var(--color-neutral-900)', textAlign: 'right' }}>{value}</dd>
                  </div>
                ))}
              </dl>
              {section.table && (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                    <thead>
                      <tr>{section.table.head.map((h, i) => <th key={h} style={{ textAlign: i ? 'right' : 'left', padding: '0.5rem', borderBottom: '2px solid var(--color-neutral-200)', color: 'var(--color-neutral-600)' }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((cells) => (
                        <tr key={cells[0]}>{cells.map((c, i) => <td key={i} style={{ textAlign: i ? 'right' : 'left', padding: '0.5rem', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)' }}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
