import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Save, Undo2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SettingsContext';
import { API_URL, authHeaders } from '../../config/api';

type Value = string | number | boolean | string[];

interface Definition {
  key: string;
  category: string;
  type: 'string' | 'text' | 'email' | 'url' | 'phone' | 'number' | 'boolean' | 'select' | 'list';
  default: Value;
  public: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  options?: string[];
  allowed?: string[];
  unit?: string;
}

interface HistoryEntry {
  id: string;
  key: string;
  oldValue: string | null;
  newValue: string;
  createdAt: string;
  user: { firstName: string | null; lastName: string | null; email: string } | null;
}

/** Listes dont l'ordre compte (sinon : cases à cocher). */
const ORDERED_LISTS = new Set(['paymentProviderPriority']);

const same = (a: Value, b: Value) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Paramètres de la plateforme : écran généré à partir du registre de l'API (settings.registry.ts).
 * Ajouter un paramètre = le déclarer dans le registre + ses libellés dans admin.config.fields.
 */
const AdminSettings = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { refresh: refreshPublicSettings } = useSiteSettings();
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [saved, setSaved] = useState<Record<string, Value>>({});
  const [draft, setDraft] = useState<Record<string, Value>>({});
  const [tab, setTab] = useState('general');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/settings/admin`, { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        setDefinitions(data.definitions);
        setSaved(data.values);
        setDraft(data.values);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`${API_URL}/settings/history`, { headers: authHeaders(token) });
    if (res.ok) setHistory(await res.json());
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, loadHistory]);

  const categories = useMemo(() => [...new Set(definitions.map((d) => d.category)), 'history'], [definitions]);
  const changedKeys = definitions.filter((d) => !same(draft[d.key], saved[d.key])).map((d) => d.key);

  const set = (key: string, value: Value) => {
    setMessage(null);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body = Object.fromEntries(changedKeys.map((k) => [k, draft[k]]));
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data?.message) ? data.message.join(' · ') : data?.message;
        throw new Error(detail || t('admin.config.error'));
      }
      setSaved(data.values);
      setDraft(data.values);
      setMessage({ ok: true, text: t('admin.config.saved') });
      refreshPublicSettings();
    } catch (err: any) {
      setMessage({ ok: false, text: err?.message || t('admin.config.error') });
    } finally {
      setSaving(false);
    }
  };

  const field = { width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', fontSize: '0.95rem', fontFamily: 'inherit', backgroundColor: 'white' };

  const renderInput = (def: Definition) => {
    const value = draft[def.key];
    const id = `setting-${def.key}`;
    switch (def.type) {
      case 'boolean':
        return (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <input id={id} type="checkbox" checked={value === true} onChange={(e) => set(def.key, e.target.checked)} style={{ width: '1.2rem', height: '1.2rem' }} />
            <span style={{ fontWeight: 600, color: value ? 'var(--color-primary-700)' : 'var(--color-neutral-500)' }}>{value ? t('admin.config.yes') : t('admin.config.no')}</span>
          </label>
        );
      case 'number':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <input id={id} type="number" min={def.min} max={def.max} step="any" value={String(value ?? '')} onChange={(e) => set(def.key, e.target.value === '' ? '' : Number(e.target.value))} style={field} />
            {def.unit && <span style={{ color: 'var(--color-neutral-600)', fontWeight: 600 }}>{def.unit}</span>}
          </div>
        );
      case 'text':
        return <textarea id={id} rows={3} maxLength={def.maxLength} value={String(value ?? '')} onChange={(e) => set(def.key, e.target.value)} style={{ ...field, lineHeight: 1.5 }} />;
      case 'select':
        return (
          <select id={id} value={String(value)} onChange={(e) => set(def.key, e.target.value)} style={{ ...field, maxWidth: '320px' }}>
            {def.options?.map((o) => <option key={o} value={o}>{t(`admin.config.options.${o}`, { defaultValue: o })}</option>)}
          </select>
        );
      case 'list': {
        const list = Array.isArray(value) ? value : [];
        if (ORDERED_LISTS.has(def.key)) {
          const move = (index: number, delta: number) => {
            const next = [...list];
            const [item] = next.splice(index, 1);
            next.splice(index + delta, 0, item);
            set(def.key, next);
          };
          return (
            <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {list.map((item, i) => (
                <li key={item}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ minWidth: '120px' }}>{item}</strong>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${t('admin.config.moveUp')} ${item}`} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem' }}><ArrowUp size={14} /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`${t('admin.config.moveDown')} ${item}`} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem' }}><ArrowDown size={14} /></button>
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {def.allowed?.map((item) => (
              <label key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={list.includes(item)} onChange={(e) => set(def.key, e.target.checked ? [...list, item] : list.filter((v) => v !== item))} />
                {item}
              </label>
            ))}
          </div>
        );
      }
      default:
        return (
          <input
            id={id}
            type={def.type === 'email' ? 'email' : def.type === 'url' ? 'url' : def.type === 'phone' ? 'tel' : 'text'}
            maxLength={def.maxLength}
            value={String(value ?? '')}
            onChange={(e) => set(def.key, e.target.value)}
            style={field}
          />
        );
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>{t('admin.config.loading')}</p>;

  const fmt = (v: string | null) => (v === null || v === '' ? '—' : v);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: changedKeys.length ? '5rem' : 0 }}>
      <h1 style={{ margin: '0 0 0.5rem', color: 'var(--color-neutral-800)' }}>{t('admin.config.title')}</h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: '1.5rem' }}>{t('admin.config.subtitle')}</p>

      <div role="tablist" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map((c) => (
          <button key={c} role="tab" aria-selected={tab === c} onClick={() => setTab(c)} className={tab === c ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}>
            {t(`admin.config.categories.${c}`, { defaultValue: c })}
            {c !== 'history' && definitions.some((d) => d.category === c && changedKeys.includes(d.key)) ? ' •' : ''}
          </button>
        ))}
      </div>

      {message && (
        <p role="status" style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: message.ok ? '#dcfce7' : '#fef2f2', color: message.ok ? '#166534' : '#b91c1c' }}>{message.text}</p>
      )}

      {tab === 'history' ? (
        history.length === 0 ? (
          <p>{t('admin.config.historyEmpty')}</p>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                  {['colDate', 'colSetting', 'colOld', 'colNew', 'colBy'].map((c) => <th key={c} style={{ padding: '0.6rem 0.8rem' }}>{t(`admin.config.${c}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderTop: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <td style={{ padding: '0.6rem 0.8rem', whiteSpace: 'nowrap' }}>{new Date(h.createdAt).toLocaleString(i18n.language)}</td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>{t(`admin.config.fields.${h.key}.label`, { defaultValue: h.key })}</td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748b', maxWidth: '220px', wordBreak: 'break-word' }}>{fmt(h.oldValue)}</td>
                    <td style={{ padding: '0.6rem 0.8rem', maxWidth: '220px', wordBreak: 'break-word' }}>{fmt(h.newValue)}</td>
                    <td style={{ padding: '0.6rem 0.8rem' }}>{h.user ? [h.user.firstName, h.user.lastName].filter(Boolean).join(' ') || h.user.email : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {definitions.filter((d) => d.category === tab).map((def) => (
            <div key={def.key}>
              <label htmlFor={`setting-${def.key}`} style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                {t(`admin.config.fields.${def.key}.label`, { defaultValue: def.key })}
                {changedKeys.includes(def.key) && <span style={{ color: '#b45309', fontWeight: 500 }}> •</span>}
              </label>
              {renderInput(def)}
              {t(`admin.config.fields.${def.key}.hint`, { defaultValue: '' }) && (
                <small style={{ display: 'block', color: 'var(--color-neutral-500)', marginTop: '0.3rem' }}>{t(`admin.config.fields.${def.key}.hint`)}</small>
              )}
            </div>
          ))}
        </div>
      )}

      {changedKeys.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, backgroundColor: 'white', borderTop: '1px solid var(--color-neutral-200)', boxShadow: '0 -4px 12px rgba(0,0,0,0.08)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#b45309', fontWeight: 600 }}>{t('admin.config.unsaved')} ({changedKeys.length})</span>
          <button type="button" onClick={() => { setDraft(saved); setMessage(null); }} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Undo2 size={16} /> {t('admin.config.cancel')}
          </button>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Save size={16} /> {saving ? t('admin.config.saving') : t('admin.config.save')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
