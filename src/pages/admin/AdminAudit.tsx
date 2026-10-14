import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Search } from 'lucide-react';
import { API_URL, authHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { compactFieldStyle, labelStyle } from '../../config/formStyles';
import { downloadProtected } from '../../lib/download';

interface AuditEntry { id: string; actorEmail: string | null; action: string; targetId: string | null; details: any; ip: string | null; createdAt: string }

/** Libellé lisible d'une action (route de l'API) ; à défaut, l'action brute. */
const ACTION_KEYS: [RegExp, string][] = [
  [/^LOGIN$/, 'login'],
  [/^LOGIN_2FA_FAILED$/, 'loginFailed'],
  [/^2FA_ENABLED$/, 'twoFactorOn'],
  [/^2FA_DISABLED$/, 'twoFactorOff'],
  [/^EXPORT /, 'export'],
  [/^PATCH \/auth\/users\/:id\/kyc$/, 'kyc'],
  [/^PUT \/auth\/users\/:id$/, 'userUpdate'],
  [/^DELETE \/auth\/users\/:id$/, 'userDelete'],
  [/^POST \/projects$/, 'projectCreate'],
  [/^PATCH \/projects\/:id$/, 'projectUpdate'],
  [/^DELETE \/projects\/:id$/, 'projectDelete'],
  [/^POST \/projects\/:id\/close$/, 'projectClose'],
  [/dossier\/documents/, 'dossierDocument'],
  [/dossier\/request-info/, 'dossierInfo'],
  [/dossier\/checklist/, 'dossierChecklist'],
  [/dossier\/messages/, 'dossierMessage'],
  [/project-updates/, 'projectUpdateReview'],
  [/^PUT \/investments\/:id\/status$/, 'investmentStatus'],
  [/^PUT \/investments\/:id\/refund$/, 'investmentRefund'],
  [/distributions|payouts/, 'distribution'],
  [/^PUT \/settings$/, 'settings'],
  [/^(POST|PATCH|DELETE) \/posts/, 'post'],
  [/^PATCH \/leads/, 'lead'],
  [/^POST \/payments/, 'payment'],
];

/** Journal d'audit : qui a fait quoi, quand, sur quoi (filtres, pagination, export CSV). */
const AdminAudit = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [filters, setFilters] = useState({ actor: '', action: '', from: '', to: '' });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AuditEntry[]; total: number; pages: number } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');

  const query = useCallback((extra: Record<string, string | number> = {}) => {
    const params = new URLSearchParams();
    Object.entries({ ...applied, ...extra }).forEach(([k, v]) => { if (v !== '' && v !== undefined) params.set(k, String(v)); });
    return params.toString();
  }, [applied]);

  const load = useCallback(() => {
    fetch(`${API_URL}/admin/audit?${query({ page })}`, { headers: authHeaders(token) })
      .then(async (r) => { if (r.ok) { setData(await r.json()); setError(''); } else setError(t('audit.loadError')); })
      .catch(() => setError(t('audit.loadError')));
  }, [query, page, token, t]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 60_000);

  const label = (action: string) => {
    const key = ACTION_KEYS.find(([re]) => re.test(action))?.[1];
    return key ? t(`audit.actions.${key}`) : action;
  };

  const exportCsv = async () => {
    const problem = await downloadProtected(`/admin/exports/audit?${query()}`, token, 'audit.csv');
    if (problem) setError(problem === 'TRUNCATED' ? t('exportsPage.truncated') : problem);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary-900)', margin: '0 0 0.5rem' }}>{t('audit.title')}</h1>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1.5rem' }}>{t('audit.intro')}</p>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filters); }} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
        <div><label htmlFor="audit-actor" style={labelStyle}>{t('audit.actor')}</label><input id="audit-actor" value={filters.actor} onChange={(e) => setFilters({ ...filters, actor: e.target.value })} placeholder="admin@…" style={{ ...compactFieldStyle, width: 220 }} /></div>
        <div><label htmlFor="audit-action" style={labelStyle}>{t('audit.action')}</label><input id="audit-action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} placeholder={t('audit.actionPlaceholder')} style={{ ...compactFieldStyle, width: 200 }} /></div>
        <div><label htmlFor="audit-from" style={labelStyle}>{t('audit.from')}</label><input id="audit-from" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} style={{ ...compactFieldStyle, width: 'auto' }} /></div>
        <div><label htmlFor="audit-to" style={labelStyle}>{t('audit.to')}</label><input id="audit-to" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} style={{ ...compactFieldStyle, width: 'auto' }} /></div>
        <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Search size={16} /> {t('audit.filter')}</button>
        <button type="button" className="btn btn-outline" onClick={exportCsv} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Download size={16} /> {t('audit.export')}</button>
      </form>

      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
      {data && (
        <>
          <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.9rem' }}>{t('audit.count', { count: data.total })}</p>
          <div style={{ overflowX: 'auto', backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                  {['date', 'actor', 'action', 'target', 'ip'].map((c) => <th key={c} scope="col" style={{ padding: '0.7rem 0.9rem', color: '#475569', fontSize: '0.85rem' }}>{t(`audit.columns.${c}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => (
                  <Fragment key={e.id}>
                    <tr onClick={() => setOpen(open === e.id ? null : e.id)} style={{ borderTop: '1px solid #f1f5f9', cursor: e.details ? 'pointer' : 'default' }}>
                      <td style={{ padding: '0.6rem 0.9rem', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{new Date(e.createdAt).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'medium' })}</td>
                      <td style={{ padding: '0.6rem 0.9rem', fontSize: '0.88rem' }}>{e.actorEmail || '—'}</td>
                      <td style={{ padding: '0.6rem 0.9rem', fontSize: '0.88rem' }}><strong>{label(e.action)}</strong><div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{e.action}</div></td>
                      <td style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-neutral-600)' }}>{e.targetId ? e.targetId.slice(0, 8) : '—'}</td>
                      <td style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{e.ip || '—'}</td>
                    </tr>
                    {open === e.id && e.details && (
                      <tr>
                        <td colSpan={5} style={{ padding: '0 0.9rem 0.75rem' }}>
                          <pre style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{JSON.stringify(e.details, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('audit.previous')}</button>
            <span style={{ fontSize: '0.9rem' }}>{t('audit.page', { page: data.pages ? page : 1, pages: data.pages })}</span>
            <button type="button" className="btn btn-outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>{t('audit.next')}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAudit;
