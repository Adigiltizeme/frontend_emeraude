import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL, authHeaders } from '../../config/api';
import { fieldStyle, labelStyle } from '../../config/formStyles';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

type Segment = 'PROJECT_INVESTORS' | 'ALL_INVESTORS' | 'ALL_USERS';
interface Broadcast {
  id: string;
  segment: Segment;
  projectTitle: string | null;
  subject: string;
  message: string;
  sendEmail: boolean;
  recipients: number;
  emailed: number;
  status: 'SENDING' | 'SENT' | 'FAILED';
  createdAt: string;
  author: { firstName: string | null; lastName: string | null; email: string } | null;
}
interface ProjectOption { id: string; title: string; status: string }

const SEGMENTS: Segment[] = ['PROJECT_INVESTORS', 'ALL_INVESTORS', 'ALL_USERS'];

/** Messages groupés : notification dans l'espace de chaque destinataire, e-mail pour ceux qui l'acceptent. */
const AdminBroadcasts = () => {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuth();
  const segments = SEGMENTS.filter((s) => s !== 'ALL_USERS' || !user?.permissions || user.permissions.includes('admins'));
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [form, setForm] = useState({ segment: 'PROJECT_INVESTORS' as Segment, projectId: '', subject: '', message: '', sendEmail: true });
  const [audience, setAudience] = useState<{ recipients: number; emailable: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const loadHistory = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/admin/broadcasts`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => null);
  }, [token]);
  useEffect(() => { loadHistory(); }, [loadHistory]);
  // Envoi en cours : avancement suivi toutes les 5 s.
  useLiveRefresh(loadHistory, 5000, history.some((b) => b.status === 'SENDING'));

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/projects`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ProjectOption[]) => setProjects((Array.isArray(data) ? data : []).filter((p) => ['COLLECTING', 'FUNDED', 'COMPLETED'].includes(p.status))))
      .catch(() => null);
  }, [token]);

  // Nombre de destinataires recalculé à chaque changement de public.
  useEffect(() => {
    setAudience(null);
    if (!token || (form.segment === 'PROJECT_INVESTORS' && !form.projectId)) return;
    const body = { segment: form.segment, ...(form.segment === 'PROJECT_INVESTORS' ? { projectId: form.projectId } : {}) };
    fetch(`${API_URL}/admin/broadcasts/preview`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then((res) => (res.ok ? res.json() : null))
      .then(setAudience)
      .catch(() => null);
  }, [token, form.segment, form.projectId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience?.recipients) return;
    if (!window.confirm(t('admin.broadcasts.confirm', { count: audience.recipients }))) return;
    setBusy(true);
    setMessage(null);
    const body = { ...form, ...(form.segment === 'PROJECT_INVESTORS' ? {} : { projectId: undefined }) };
    const res = await fetch(`${API_URL}/admin/broadcasts`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setMessage({ ok: true, text: t('admin.broadcasts.sent', { count: data.recipients }) });
      setForm((f) => ({ ...f, subject: '', message: '' }));
      loadHistory();
    } else {
      setMessage({ ok: false, text: Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('admin.broadcasts.error') });
    }
  };

  const card = { backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' };
  const date = (v: string) => new Date(v).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ color: 'var(--color-primary-900)', marginTop: 0 }}>{t('admin.broadcasts.title')}</h1>
      <p style={{ color: 'var(--color-neutral-600)' }}>{t('admin.broadcasts.intro')}</p>

      <form onSubmit={send} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label htmlFor="bc-segment" style={labelStyle}>{t('admin.broadcasts.segment')}</label>
            <select id="bc-segment" name="segment" className="form-control" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value as Segment })} style={fieldStyle}>
              {segments.map((s) => <option key={s} value={s}>{t(`admin.broadcasts.segments.${s}`)}</option>)}
            </select>
          </div>
          {form.segment === 'PROJECT_INVESTORS' && (
            <div style={{ flex: '1 1 260px' }}>
              <label htmlFor="bc-project" style={labelStyle}>{t('admin.broadcasts.project')}</label>
              <select id="bc-project" name="projectId" className="form-control" required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} style={fieldStyle}>
                <option value="">{t('admin.broadcasts.chooseProject')}</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
        </div>

        <p role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, color: 'var(--color-neutral-700)', fontSize: '0.92rem' }}>
          <Users size={16} />
          {audience ? t('admin.broadcasts.audience', { count: audience.recipients, emailable: audience.emailable }) : t('admin.broadcasts.audiencePending')}
        </p>

        <div>
          <label htmlFor="bc-subject" style={labelStyle}>{t('admin.broadcasts.subject')}</label>
          <input id="bc-subject" name="subject" className="form-control" required minLength={3} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="bc-message" style={labelStyle}>{t('admin.broadcasts.message')}</label>
          <textarea id="bc-message" name="message" className="form-control" required minLength={10} maxLength={3000} rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...fieldStyle, lineHeight: 1.6 }} />
        </div>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
          <input type="checkbox" name="sendEmail" checked={form.sendEmail} onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })} style={{ marginTop: '0.2rem' }} />
          <span>
            {t('admin.broadcasts.sendEmail')}
            <small style={{ display: 'block', color: 'var(--color-neutral-500)' }}>{t(form.segment === 'PROJECT_INVESTORS' ? 'admin.broadcasts.emailHintProject' : 'admin.broadcasts.emailHintNewsletter')}</small>
          </span>
        </label>
        {message && <p role={message.ok ? 'status' : 'alert'} style={{ margin: 0, padding: '0.75rem 1rem', borderRadius: 8, backgroundColor: message.ok ? '#f0fdf4' : '#fef2f2', color: message.ok ? '#166534' : '#991b1b' }}>{message.text}</p>}
        <div>
          <button type="submit" className="btn btn-primary" disabled={busy || !audience?.recipients} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Send size={16} /> {busy ? t('admin.broadcasts.sending') : t('admin.broadcasts.send')}
          </button>
        </div>
      </form>

      <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary-900)' }}>{t('admin.broadcasts.history')}</h2>
      <div style={card}>
        {history.length === 0 ? <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>{t('admin.broadcasts.empty')}</p> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {history.map((b, i) => (
              <li key={b.id} style={{ padding: '0.9rem 0', borderTop: i ? '1px solid var(--color-neutral-100, #f1f5f9)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--color-neutral-800)' }}>{b.subject}</strong>
                  <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: 999, backgroundColor: b.status === 'SENT' ? '#dcfce7' : b.status === 'FAILED' ? '#fee2e2' : '#fef3c7', color: b.status === 'SENT' ? '#166534' : b.status === 'FAILED' ? '#991b1b' : '#92400e' }}>{t(`admin.broadcasts.statuses.${b.status}`)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                  {date(b.createdAt)} · {t(`admin.broadcasts.segments.${b.segment}`)}{b.projectTitle ? ` « ${b.projectTitle} »` : ''} · {t('admin.broadcasts.counts', { count: b.recipients, emailed: b.sendEmail ? b.emailed : 0 })}
                  {b.author && ` · ${[b.author.firstName, b.author.lastName].filter(Boolean).join(' ') || b.author.email}`}
                </div>
                <p style={{ margin: '0.4rem 0 0', whiteSpace: 'pre-wrap', color: 'var(--color-neutral-700)', fontSize: '0.9rem' }}>{b.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminBroadcasts;
