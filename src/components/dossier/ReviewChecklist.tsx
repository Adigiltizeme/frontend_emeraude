import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, authHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface Item { label: string; done: boolean; by: string | null; at: string | null }

/** Liste de contrôle de l'étude d'un dossier (points définis dans les paramètres) ; chaque point garde son auteur et sa date. */
const ReviewChecklist = ({ projectId }: { projectId: string }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<{ required: boolean; items: Item[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/${projectId}/dossier/checklist`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [projectId, token]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (item: Item) => {
    setBusy(item.label);
    setError('');
    const res = await fetch(`${API_URL}/projects/${projectId}/dossier/checklist`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: item.label, done: !item.done }),
    }).catch(() => null);
    if (res?.ok) setData(await res.json());
    else { setError(t('checklist.error')); load(); }
    setBusy(null);
  };

  if (!data) return null;
  const done = data.items.filter((i) => i.done).length;

  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', color: 'var(--color-neutral-600)', fontSize: '0.9rem' }}>
        {t('checklist.progress', { done, total: data.items.length })} · {t(data.required ? 'checklist.required' : 'checklist.optional')}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {data.items.map((item) => (
          <li key={item.label}>
            <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', backgroundColor: item.done ? '#f0fdf4' : 'white' }}>
              <input type="checkbox" checked={item.done} disabled={busy !== null} onChange={() => toggle(item)} style={{ marginTop: '0.2rem', width: '1.1rem', height: '1.1rem' }} />
              <span>
                <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{item.label}</span>
                {item.by && item.at && (
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
                    {t(item.done ? 'checklist.checkedBy' : 'checklist.uncheckedBy', { by: item.by, date: new Date(item.at).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' }) })}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {error && <p role="alert" style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
};

export default ReviewChecklist;
