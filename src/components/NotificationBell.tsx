import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';

interface AppNotification {
  id: string;
  type: string;
  data: Record<string, any> | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Centre de notifications : cloche dans l'en-tête, pastille du nombre de non lues, historique récent. */
const NotificationBell = ({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const apply = (data: { items: AppNotification[]; unread: number } | null) => {
    if (!data) return;
    setItems(data.items);
    setUnread(data.unread);
  };

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/notifications`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then(apply)
      .catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load);
  useEffect(() => {
    if (!socket) return;
    socket.on('notification.new', load);
    return () => { socket.off('notification.new', load); };
  }, [socket, load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  const post = (path: string) =>
    fetch(`${API_URL}/notifications/${path}`, { method: 'POST', headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then(apply)
      .catch(() => {});

  const openItem = (n: AppNotification) => {
    if (!n.readAt) post(`${n.id}/read`);
    setOpen(false);
    if (n.link) { navigate(n.link); onNavigate?.(); }
  };

  const text = (n: AppNotification) => {
    const data = n.data || {};
    return t(`notifications.types.${n.type}`, {
      ...data,
      amount: typeof data.amount === 'number' ? formatMoney(data.amount, i18n.language) : '',
      status: data.status ? t(`admin.status.${data.status}`) : '',
      defaultValue: t('notifications.types.DEFAULT'),
    });
  };

  if (!token) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? t('notifications.openUnread', { count: unread }) : t('notifications.open')}
        aria-expanded={open}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-900)', padding: '0.35rem', display: 'flex' }}
      >
        <Bell size={compact ? 24 : 22} />
        {unread > 0 && (
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, backgroundColor: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label={t('notifications.title')} style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: compact ? 'auto' : 0, left: compact ? 0 : 'auto', width: 'min(360px, calc(100vw - 2rem))', maxHeight: '70vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: '10px', border: '1px solid var(--color-neutral-200)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', zIndex: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            <strong style={{ color: 'var(--color-neutral-900)' }}>{t('notifications.title')}</strong>
            {unread > 0 && (
              <button type="button" onClick={() => post('read-all')} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                {t('notifications.markAll')}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p style={{ padding: '1.25rem 1rem', margin: 0, color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>{t('notifications.empty')}</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    style={{ display: 'flex', gap: '0.6rem', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', borderBottom: '1px solid var(--color-neutral-100)', backgroundColor: n.readAt ? 'white' : 'var(--color-primary-50, #ecfdf5)', cursor: n.link ? 'pointer' : 'default' }}
                  >
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', marginTop: '0.45rem', flexShrink: 0, backgroundColor: n.readAt ? 'transparent' : 'var(--color-primary-600)' }} />
                    <span>
                      <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-neutral-800)', lineHeight: 1.4 }}>{text(n)}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>
                        {new Date(n.createdAt).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
