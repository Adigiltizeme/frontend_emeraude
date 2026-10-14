import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { API_URL, authHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { fieldStyle } from '../../config/formStyles';

interface Message {
  id: string; content: string; createdAt: string;
  author: { id: string; firstName: string | null; lastName: string | null; role: string } | null;
}

/** Fil d'échanges d'un projet entre son porteur et l'équipe (temps réel). */
const ProjectThread = ({ projectId }: { projectId: string }) => {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/${projectId}/dossier/messages`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch(() => {});
  }, [projectId, token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);
  useEffect(() => {
    if (!socket) return;
    const onMessage = (e: { projectId?: string }) => { if (e?.projectId === projectId) load(); };
    socket.on('project.message', onMessage);
    return () => { socket.off('project.message', onMessage); };
  }, [socket, projectId, load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/dossier/messages`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      });
      if (!res.ok) throw new Error();
      setDraft('');
      load();
    } catch {
      setError(t('thread.error'));
    } finally {
      setSending(false);
    }
  };

  const authorName = (m: Message) => {
    if (!m.author) return t('thread.formerUser');
    if (m.author.role === 'ADMIN') return t('thread.team');
    return `${m.author.firstName ?? ''} ${m.author.lastName ?? ''}`.trim() || t('thread.owner');
  };

  return (
    <section>
      <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.25rem' }}>
        {messages.length === 0 && <p style={{ color: 'var(--color-neutral-500)' }}>{t('thread.empty')}</p>}
        {messages.map((m) => {
          const mine = m.author?.id === user?.id;
          return (
            <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '0.6rem 0.85rem', borderRadius: '10px', backgroundColor: mine ? 'var(--color-primary-50, #ecfdf5)' : '#f8fafc', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', marginBottom: '0.2rem' }}>
                <strong style={{ color: m.author?.role === 'ADMIN' ? 'var(--color-primary-700)' : 'var(--color-neutral-700)' }}>{authorName(m)}</strong> · {new Date(m.createdAt).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' })}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>{m.content}</div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'flex-end' }}>
        <label htmlFor={`thread-${projectId}`} style={{ position: 'absolute', left: '-10000px' }}>{t('thread.placeholder')}</label>
        <textarea id={`thread-${projectId}`} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={4000} rows={2} placeholder={t('thread.placeholder')} style={{ ...fieldStyle, resize: 'vertical', flex: 1 }} />
        <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Send size={16} /> {t('thread.send')}
        </button>
      </form>
      {error && <p role="alert" style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{error}</p>}
    </section>
  );
};

export default ProjectThread;
