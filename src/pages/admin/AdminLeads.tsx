import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { API_URL, authHeaders } from '../../config/api';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

interface Lead {
  id: string;
  type: 'CONTACT' | 'NEWSLETTER';
  name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  status: 'NEW' | 'HANDLED' | 'ARCHIVED';
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  NEW: { bg: '#dbeafe', color: '#1d4ed8' },
  HANDLED: { bg: '#dcfce7', color: '#16a34a' },
  ARCHIVED: { bg: '#f1f5f9', color: '#475569' },
};

/** Messages du formulaire de contact et inscriptions à la lettre d'information. */
const AdminLeads = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'' | 'CONTACT' | 'NEWSLETTER'>('');
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/leads${filter ? `?type=${filter}` : ''}`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Nouvelle demande en direct + filet de sécurité toutes les 15 s.
  useEffect(() => {
    if (!socket) return;
    socket.on('lead.new', fetchLeads);
    return () => { socket.off('lead.new', fetchLeads); };
  }, [socket, fetchLeads]);
  useLiveRefresh(fetchLeads, 15_000);

  const setStatus = async (id: string, status: Lead['status']) => {
    const res = await fetch(`${API_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const th = { padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, textAlign: 'left' as const };
  const smallBtn = { padding: '0.35rem 0.75rem', fontSize: '0.8rem' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary-900)', margin: '0 0 1.5rem 0' }}>{t('admin.leads.title')}</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['', 'CONTACT', 'NEWSLETTER'] as const).map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)} className={filter === f ? 'btn btn-primary' : 'btn btn-outline'} style={smallBtn}>
            {f ? t(`admin.leads.types.${f}`) : t('admin.leads.filterAll')}
          </button>
        ))}
      </div>

      {loading ? (
        <p>{t('admin.leads.loading')}</p>
      ) : leads.length === 0 ? (
        <p>{t('admin.leads.empty')}</p>
      ) : (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>{t('admin.leads.colDate')}</th>
                <th style={th}>{t('admin.leads.colType')}</th>
                <th style={th}>{t('admin.leads.colContact')}</th>
                <th style={th}>{t('admin.leads.colRequest')}</th>
                <th style={th}>{t('admin.leads.colStatus')}</th>
                <th style={{ ...th, textAlign: 'right' }}>{t('admin.leads.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#475569' }}>{new Date(lead.createdAt).toLocaleString(i18n.language)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{t(`admin.leads.types.${lead.type}`)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {lead.name && <div style={{ fontWeight: 600 }}>{lead.name}</div>}
                    <div style={{ fontSize: '0.85rem' }}>{lead.email}</div>
                    {lead.phone && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lead.phone}</div>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '420px' }}>
                    {lead.subject && <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t(`admin.leads.subjects.${lead.subject}`, { defaultValue: lead.subject })}</div>}
                    {lead.message && <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{lead.message}</div>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: STATUS_COLORS[lead.status].bg, color: STATUS_COLORS[lead.status].color }}>
                      {t(`admin.leads.statuses.${lead.status}`)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {lead.type === 'CONTACT' && (
                        <a href={`mailto:${lead.email}`} className="btn btn-outline" style={smallBtn}>{t('admin.leads.reply')}</a>
                      )}
                      {lead.status === 'NEW' && (
                        <button onClick={() => setStatus(lead.id, 'HANDLED')} className="btn btn-primary" style={smallBtn}>{t('admin.leads.markHandled')}</button>
                      )}
                      {lead.status !== 'ARCHIVED' ? (
                        <button onClick={() => setStatus(lead.id, 'ARCHIVED')} className="btn btn-outline" style={smallBtn}>{t('admin.leads.archive')}</button>
                      ) : (
                        <button onClick={() => setStatus(lead.id, 'NEW')} className="btn btn-outline" style={smallBtn}>{t('admin.leads.reopen')}</button>
                      )}
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

export default AdminLeads;
