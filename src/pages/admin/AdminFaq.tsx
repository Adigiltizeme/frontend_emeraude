import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL, authHeaders } from '../../config/api';
import { fieldStyle, labelStyle } from '../../config/formStyles';

interface FaqItem {
  id: string;
  locale: 'fr' | 'en';
  category: string;
  question: string;
  answer: string;
  position: number;
  published: boolean;
}

const CATEGORIES = ['general', 'investing', 'risks', 'payments', 'owners', 'account'];
const EMPTY = { question: '', answer: '', category: 'general', published: true };

/** FAQ du site : questions par langue, ordre, publication (texte brut, {{minTicket}} remplacé à l'affichage). */
const AdminFaq = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [editing, setEditing] = useState<FaqItem | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/faq/admin`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const list = items.filter((i) => i.locale === locale).sort((a, b) => a.position - b.position);

  const request = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(`${API_URL}/faq${path}`, {
      method,
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    if (!res?.ok) {
      const data = await res?.json().catch(() => null);
      throw new Error(Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('admin.faq.error'));
    }
    return res.json();
  };

  const open = (item: FaqItem | 'new') => {
    setEditing(item);
    setMessage(null);
    setForm(item === 'new' ? EMPTY : { question: item.question, answer: item.answer, category: item.category, published: item.published });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing === 'new') await request('POST', '', { ...form, locale });
      else if (editing) await request('PATCH', `/${editing.id}`, form);
      setEditing(null);
      setMessage({ ok: true, text: t('admin.faq.saved') });
      load();
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  // Échange de position avec la question voisine.
  const move = async (index: number, delta: -1 | 1) => {
    const a = list[index];
    const b = list[index + delta];
    if (!a || !b) return;
    setBusy(true);
    try {
      const [posA, posB] = a.position === b.position ? [b.position + delta, a.position] : [b.position, a.position];
      await request('PATCH', `/${a.id}`, { position: Math.max(0, posA) });
      await request('PATCH', `/${b.id}`, { position: Math.max(0, posB) });
      load();
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: FaqItem) => {
    if (!window.confirm(t('admin.faq.confirmDelete', { question: item.question }))) return;
    try {
      await request('DELETE', `/${item.id}`);
      load();
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  };

  const card = { backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>{t('admin.faq.title')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => open('new')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Plus size={18} /> {t('admin.faq.new')}</button>
      </div>
      <p style={{ color: 'var(--color-neutral-600)', marginTop: 0 }}>{t('admin.faq.intro')}</p>

      <div role="tablist" aria-label={t('admin.faq.language')} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        {(['fr', 'en'] as const).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={locale === l} onClick={() => { setLocale(l); setEditing(null); }} className={locale === l ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.4rem 1rem' }}>
            {t(`admin.faq.languages.${l}`)} ({items.filter((i) => i.locale === l).length})
          </button>
        ))}
      </div>

      {message && <p role={message.ok ? 'status' : 'alert'} style={{ padding: '0.75rem 1rem', borderRadius: 8, backgroundColor: message.ok ? '#f0fdf4' : '#fef2f2', color: message.ok ? '#166534' : '#991b1b' }}>{message.text}</p>}

      {editing && (
        <form onSubmit={save} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', border: '1px solid var(--color-primary-200, #a7f3d0)' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{editing === 'new' ? t('admin.faq.new') : t('admin.faq.edit')} · {t(`admin.faq.languages.${locale}`)}</h2>
          <div>
            <label htmlFor="faq-question" style={labelStyle}>{t('admin.faq.question')}</label>
            <input id="faq-question" name="question" className="form-control" required minLength={5} maxLength={300} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="faq-answer" style={labelStyle}>{t('admin.faq.answer')}</label>
            <textarea id="faq-answer" name="answer" className="form-control" required minLength={5} maxLength={5000} rows={7} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={{ ...fieldStyle, lineHeight: 1.6 }} />
            <small style={{ display: 'block', color: 'var(--color-neutral-500)', marginTop: '0.3rem' }}>{t('admin.faq.answerHint')}</small>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label htmlFor="faq-category" style={labelStyle}>{t('admin.faq.category')}</label>
              <select id="faq-category" name="category" className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={fieldStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`faq.categories.${c}`)}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              {t('admin.faq.published')}
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? t('admin.faq.saving') : t('admin.faq.save')}</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>{t('admin.faq.cancel')}</button>
          </div>
        </form>
      )}

      <div style={card}>
        {loading ? <p role="status">{t('common.loading')}</p> : list.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-500)', margin: 0 }}>{t('admin.faq.empty')}</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {list.map((item, index) => (
              <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderTop: index ? '1px solid var(--color-neutral-100, #f1f5f9)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{item.question}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>
                    {t(`faq.categories.${item.category}`)}
                    {!item.published && <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.5rem', borderRadius: 999, backgroundColor: '#fef3c7', color: '#92400e' }}>{t('admin.faq.hidden')}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  <button type="button" className="btn btn-outline" aria-label={t('admin.faq.moveUp')} title={t('admin.faq.moveUp')} disabled={busy || index === 0} onClick={() => move(index, -1)} style={{ padding: '0.35rem 0.5rem' }}><ArrowUp size={16} /></button>
                  <button type="button" className="btn btn-outline" aria-label={t('admin.faq.moveDown')} title={t('admin.faq.moveDown')} disabled={busy || index === list.length - 1} onClick={() => move(index, 1)} style={{ padding: '0.35rem 0.5rem' }}><ArrowDown size={16} /></button>
                  <button type="button" className="btn btn-outline" aria-label={t('admin.faq.edit')} title={t('admin.faq.edit')} onClick={() => open(item)} style={{ padding: '0.35rem 0.5rem' }}><Pencil size={16} /></button>
                  <button type="button" className="btn btn-outline" aria-label={t('admin.faq.delete')} title={t('admin.faq.delete')} onClick={() => remove(item)} style={{ padding: '0.35rem 0.5rem', color: '#b91c1c', borderColor: '#fecaca' }}><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default AdminFaq;
