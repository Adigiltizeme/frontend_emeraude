import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL, authHeaders } from '../../config/api';
import { fieldStyle } from '../../config/formStyles';

interface Post {
  id: string;
  slug: string;
  locale: 'fr' | 'en';
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

const EMPTY = { title: '', slug: '', excerpt: '', content: '', locale: 'fr', status: 'DRAFT' };

/** CMS des actualités : liste et éditeur d'articles (contenu texte, aucun HTML). */
const AdminPosts = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const fetchPosts = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/posts/admin/all`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const open = (post: Post | 'new') => {
    setEditing(post);
    setCover(null);
    setMessage(null);
    setForm(post === 'new' ? EMPTY : { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, locale: post.locale, status: post.status });
  };

  const close = () => {
    setEditing(null);
    fetchPosts();
  };

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const isNew = editing === 'new';
      const res = await fetch(`${API_URL}/posts${isNew ? '' : `/${(editing as Post).id}`}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: form.slug.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(detail || t('admin.posts.error'));
      }
      let saved: Post = data;
      if (cover) {
        const body = new FormData();
        body.append('file', cover);
        const up = await fetch(`${API_URL}/posts/${saved.id}/cover`, { method: 'POST', headers: authHeaders(token), body });
        if (up.ok) saved = await up.json();
        setCover(null);
      }
      setEditing(saved);
      setForm((f) => ({ ...f, slug: saved.slug }));
      setMessage({ ok: true, text: t('admin.posts.saved') });
    } catch (err: any) {
      setMessage({ ok: false, text: err?.message || t('admin.posts.error') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: Post) => {
    if (!window.confirm(t('admin.posts.confirmDelete'))) return;
    const res = await fetch(`${API_URL}/posts/${post.id}`, { method: 'DELETE', headers: authHeaders(token) });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  const field = fieldStyle;
  const label = { display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' } as const;
  const hint = { display: 'block', fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' } as const;

  if (editing) {
    const current = editing === 'new' ? null : editing;
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button type="button" onClick={close} className="btn btn-outline" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>← {t('admin.posts.cancel')}</button>
        <form onSubmit={save} style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{current ? t('admin.posts.edit') : t('admin.posts.new')}</h1>
          <div>
            <label htmlFor="post-title" style={label}>{t('admin.posts.fieldTitle')}</label>
            <input id="post-title" name="title" required minLength={3} maxLength={160} value={form.title} onChange={change} style={field} />
          </div>
          <div>
            <label htmlFor="post-slug" style={label}>{t('admin.posts.fieldSlug')}</label>
            <input id="post-slug" name="slug" maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={change} style={field} placeholder="investir-a-dakar" />
            <small style={hint}>{t('admin.posts.slugHint')}</small>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="post-locale" style={label}>{t('admin.posts.fieldLanguage')}</label>
              <select id="post-locale" name="locale" value={form.locale} onChange={change} style={field}>
                <option value="fr">{t('admin.posts.languages.fr')}</option>
                <option value="en">{t('admin.posts.languages.en')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-status" style={label}>{t('admin.posts.fieldStatus')}</label>
              <select id="post-status" name="status" value={form.status} onChange={change} style={field}>
                <option value="DRAFT">{t('admin.posts.statuses.DRAFT')}</option>
                <option value="PUBLISHED">{t('admin.posts.statuses.PUBLISHED')}</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" style={label}>{t('admin.posts.fieldExcerpt')}</label>
            <textarea id="post-excerpt" name="excerpt" required minLength={10} maxLength={300} rows={2} value={form.excerpt} onChange={change} style={field} />
          </div>
          <div>
            <label htmlFor="post-content" style={label}>{t('admin.posts.fieldContent')}</label>
            <textarea id="post-content" name="content" required minLength={20} maxLength={50000} rows={16} value={form.content} onChange={change} style={{ ...field, lineHeight: 1.6 }} />
            <small style={hint}>{t('admin.posts.contentHint')}</small>
          </div>
          <div>
            <label htmlFor="post-cover" style={label}>{t('admin.posts.fieldCover')}</label>
            {current?.coverImage && <img src={current.coverImage} alt="" style={{ display: 'block', maxWidth: '260px', borderRadius: '8px', marginBottom: '0.5rem' }} />}
            <input id="post-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] || null)} />
          </div>

          {message && (
            <p role="status" style={{ margin: 0, padding: '0.75rem', borderRadius: '6px', backgroundColor: message.ok ? '#dcfce7' : '#fef2f2', color: message.ok ? '#166534' : '#b91c1c' }}>{message.text}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('admin.posts.saving') : t('admin.posts.save')}</button>
            {current?.status === 'PUBLISHED' && (
              <Link to={`/actualites/${current.slug}`} target="_blank" className="btn btn-outline">{t('admin.posts.view')}</Link>
            )}
          </div>
        </form>
      </div>
    );
  }

  const th = { padding: '0.75rem 1rem', textAlign: 'left' as const, color: '#475569', fontWeight: 600 };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>{t('admin.posts.title')}</h1>
        <button type="button" onClick={() => open('new')} className="btn btn-primary">{t('admin.posts.new')}</button>
      </div>

      {loading ? (
        <p>{t('admin.posts.loading')}</p>
      ) : posts.length === 0 ? (
        <p>{t('admin.posts.empty')}</p>
      ) : (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>{t('admin.posts.colTitle')}</th>
                <th style={th}>{t('admin.posts.colLanguage')}</th>
                <th style={th}>{t('admin.posts.colStatus')}</th>
                <th style={th}>{t('admin.posts.colUpdated')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{t('admin.posts.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{post.title}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t(`admin.posts.languages.${post.locale}`)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: post.status === 'PUBLISHED' ? '#dcfce7' : '#f1f5f9', color: post.status === 'PUBLISHED' ? '#16a34a' : '#475569' }}>
                      {t(`admin.posts.statuses.${post.status}`)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{new Date(post.updatedAt).toLocaleDateString(i18n.language)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => open(post)} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>{t('admin.posts.edit')}</button>
                      <button type="button" onClick={() => remove(post)} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', color: '#b91c1c', borderColor: '#fca5a5' }}>{t('admin.posts.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
