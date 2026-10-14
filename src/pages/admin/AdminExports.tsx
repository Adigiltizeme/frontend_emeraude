import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { compactFieldStyle, labelStyle } from '../../config/formStyles';
import { downloadProtected } from '../../lib/download';

/** Exports et permission du domaine (identiques à l'API : admin/exports.service.ts). */
const KINDS: { kind: string; permission: string }[] = [
  { kind: 'investments', permission: 'investments' },
  { kind: 'payments', permission: 'investments' },
  { kind: 'payouts', permission: 'distributions' },
  { kind: 'users', permission: 'users' },
  { kind: 'leads', permission: 'leads' },
  { kind: 'audit', permission: 'audit' },
];

/** Exports CSV (séparateur « ; », ouverture directe dans Excel), filtrables par période ; chaque export est journalisé. */
const AdminExports = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const allowed = KINDS.filter((k) => user?.permissions?.includes(k.permission));

  const run = async (kind: string) => {
    setBusy(kind);
    setError('');
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const problem = await downloadProtected(`/admin/exports/${kind}?${params}`, token, `${kind}.csv`);
    if (problem) setError(problem === 'TRUNCATED' ? t('exportsPage.truncated') : problem);
    setBusy(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary-900)', margin: '0 0 0.5rem' }}>{t('exportsPage.title')}</h1>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1.5rem' }}>{t('exportsPage.intro')}</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div><label htmlFor="exp-from" style={labelStyle}>{t('audit.from')}</label><input id="exp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...compactFieldStyle, width: 'auto' }} /></div>
        <div><label htmlFor="exp-to" style={labelStyle}>{t('audit.to')}</label><input id="exp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...compactFieldStyle, width: 'auto' }} /></div>
      </div>
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.75rem' }}>
        {allowed.map(({ kind }) => (
          <div key={kind} style={{ backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <strong>{t(`exportsPage.kinds.${kind}.title`)}</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-neutral-600)' }}>{t(`exportsPage.kinds.${kind}.desc`)}</span>
            <button type="button" className="btn btn-outline" disabled={busy !== null} onClick={() => run(kind)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start' }}>
              <Download size={16} /> {busy === kind ? t('exportsPage.preparing') : t('exportsPage.download')}
            </button>
          </div>
        ))}
      </div>
      {!allowed.length && <p>{t('exportsPage.none')}</p>}
    </div>
  );
};

export default AdminExports;
