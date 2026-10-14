import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Megaphone } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { compactFieldStyle, fieldStyle, labelStyle } from '../config/formStyles';
import ArticleContent from './ArticleContent';

interface ProjectUpdate {
  id: string; title: string; content: string; images: string[]; visibility: 'INVESTORS' | 'PUBLIC';
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED'; reviewComment?: string | null; publishedAt: string | null; createdAt: string;
  author: { name: string | null; team: boolean } | null;
}
interface Feed { canPost: boolean; restricted: number; items: ProjectUpdate[] }

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#fef3c7', fg: '#92400e' },
  PUBLISHED: { bg: '#dcfce7', fg: '#166534' },
  REJECTED: { bg: '#fee2e2', fg: '#991b1b' },
};

/**
 * Actualités d'un projet. Visiteur : actualités publiques (et mention des actualités réservées aux investisseurs).
 * Porteur et équipe (`manage`) : rédaction, statut de validation ; équipe (`admin`) : publication ou refus motivé.
 */
const ProjectUpdatesFeed = ({ projectId, manage = false, admin = false, embedded = false }: { projectId: string; manage?: boolean; admin?: boolean; embedded?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [form, setForm] = useState({ title: '', content: '', visibility: 'INVESTORS' });
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/${projectId}/updates`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setFeed(data))
      .catch(() => {});
  }, [projectId, token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, manage ? 15_000 : undefined);

  const run = async (fn: () => Promise<Response>, success?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('updates.error'));
      if (success) setMessage({ ok: true, text: success });
      load();
      return data;
    } catch (e: any) {
      setMessage({ ok: false, text: e.message });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append('title', form.title);
    body.append('content', form.content);
    body.append('visibility', form.visibility);
    images.forEach((f) => body.append('images', f));
    const created = await run(() => fetch(`${API_URL}/projects/${projectId}/updates`, { method: 'POST', headers: authHeaders(token), body }));
    if (created) {
      setMessage({ ok: true, text: t(created.status === 'PENDING' ? 'updates.sentForReview' : 'updates.published') });
      setForm({ title: '', content: '', visibility: 'INVESTORS' });
      setImages([]);
    }
  };

  const review = (u: ProjectUpdate, action: 'PUBLISH' | 'REJECT') => {
    let comment: string | undefined;
    if (action === 'REJECT') {
      const answer = window.prompt(t('updates.rejectPrompt'));
      if (!answer?.trim()) return;
      comment = answer.trim();
    }
    run(() => fetch(`${API_URL}/admin/project-updates/${u.id}`, { method: 'PATCH', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ action, comment }) }));
  };

  const remove = (u: ProjectUpdate) => {
    if (!window.confirm(t('updates.confirmDelete'))) return;
    run(() => fetch(`${API_URL}/project-updates/${u.id}`, { method: 'DELETE', headers: authHeaders(token) }));
  };

  if (!feed) return null;
  // Fiche publique (même consultée par le porteur ou l'équipe) : actualités publiées uniquement.
  const items = manage ? feed.items : feed.items.filter((u) => u.status === 'PUBLISHED');
  if (!manage && !items.length && !feed.restricted) return null;

  const content = (
    <>
      {manage && feed.canPost && (
        <form onSubmit={publish} style={{ display: 'grid', gap: '0.75rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-neutral-200)', backgroundColor: '#f8fafc', marginBottom: '1.25rem' }}>
          <strong>{t('updates.compose')}</strong>
          <div>
            <label htmlFor={`upd-title-${projectId}`} style={labelStyle}>{t('updates.title')}</label>
            <input id={`upd-title-${projectId}`} type="text" maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor={`upd-content-${projectId}`} style={labelStyle}>{t('updates.content')}</label>
            <textarea id={`upd-content-${projectId}`} rows={5} maxLength={10000} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={t('updates.contentHint')} style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label htmlFor={`upd-vis-${projectId}`} style={labelStyle}>{t('updates.visibility')}</label>
              <select id={`upd-vis-${projectId}`} value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} style={{ ...compactFieldStyle, width: 'auto' }}>
                <option value="INVESTORS">{t('updates.visibilities.INVESTORS')}</option>
                <option value="PUBLIC">{t('updates.visibilities.PUBLIC')}</option>
              </select>
            </div>
            <div>
              <label htmlFor={`upd-img-${projectId}`} style={labelStyle}>{t('updates.images')}</label>
              <input id={`upd-img-${projectId}`} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 4))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy || form.title.trim().length < 3 || form.content.trim().length < 10}>{busy ? t('updates.sending') : t(admin || !settings.projectUpdatesRequireReview ? 'updates.publishNow' : 'updates.submit')}</button>
          </div>
          {!admin && settings.projectUpdatesRequireReview && <small style={{ color: 'var(--color-neutral-500)' }}>{t('updates.reviewNotice')}</small>}
        </form>
      )}
      {message && <p role={message.ok ? 'status' : 'alert'} style={{ color: message.ok ? '#166534' : '#b91c1c', margin: '0 0 1rem' }}>{message.text}</p>}

      {items.length === 0 && manage && <p style={{ color: 'var(--color-neutral-500)' }}>{t('updates.empty')}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((u) => (
          <article key={u.id} style={{ padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-neutral-200)', backgroundColor: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{u.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {u.visibility === 'INVESTORS' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--color-neutral-600)' }}><Lock size={13} /> {t('updates.investorsOnly')}</span>}
                {manage && <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: STATUS_COLORS[u.status].bg, color: STATUS_COLORS[u.status].fg }}>{t(`updates.status.${u.status}`)}</span>}
              </div>
            </header>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', margin: '0.3rem 0 0.75rem' }}>
              {new Date(u.publishedAt ?? u.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{u.author?.team || !u.author ? t('updates.byTeam') : t('updates.byOwner', { name: u.author.name || t('thread.owner') })}
            </div>
            <ArticleContent content={u.content} />
            {u.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
                {u.images.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={t('updates.photo', { n: i + 1 })} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: '8px', display: 'block' }} /></a>
                ))}
              </div>
            )}
            {manage && u.reviewComment && <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', color: u.status === 'REJECTED' ? '#991b1b' : 'var(--color-neutral-600)' }}><strong>{t('updates.reviewComment')}</strong> {u.reviewComment}</p>}
            {manage && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {admin && u.status === 'PENDING' && <button type="button" disabled={busy} onClick={() => review(u, 'PUBLISH')} className="btn btn-primary" style={{ padding: '0.35rem 0.8rem' }}>{t('updates.approve')}</button>}
                {admin && u.status === 'PENDING' && <button type="button" disabled={busy} onClick={() => review(u, 'REJECT')} className="btn btn-outline" style={{ padding: '0.35rem 0.8rem' }}>{t('updates.reject')}</button>}
                {(admin || u.status !== 'PUBLISHED') && <button type="button" disabled={busy} onClick={() => remove(u)} className="btn btn-outline" style={{ padding: '0.35rem 0.8rem', color: '#b91c1c' }}>{t('updates.delete')}</button>}
              </div>
            )}
          </article>
        ))}
      </div>
      {!manage && feed.restricted > 0 && (
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-neutral-600)', fontSize: '0.9rem', marginTop: items.length ? '1rem' : 0 }}>
          <Lock size={15} /> {t('updates.restricted', { count: feed.restricted })}
        </p>
      )}
    </>
  );

  if (embedded) return <div>{content}</div>;
  return (
    <section id="actualites" style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: '0 0 1rem' }}><Megaphone size={22} color="var(--color-primary-600)" /> {t('updates.sectionTitle')}</h2>
      {content}
    </section>
  );
};

export default ProjectUpdatesFeed;
