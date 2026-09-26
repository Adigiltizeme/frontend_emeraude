import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/support/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/support/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;
    
    try {
      const res = await fetch(`${API_URL}/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: replyMessage })
      });
      if (res.ok) {
        setReplyMessage('');
        loadTicket(activeTicket.id); // reload ticket to get new message
        fetchTickets(); // refresh list to update counts/dates
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicket) return;
    try {
      const res = await fetch(`${API_URL}/support/tickets/${activeTicket.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadTicket(activeTicket.id);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><AlertCircle size={14} /> Nouveau</span>;
      case 'IN_PROGRESS': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><Clock size={14} /> En cours</span>;
      case 'RESOLVED': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><CheckCircle size={14} /> Résolu</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: 'calc(100vh - 150px)' }}>
      
      {/* Colonne Liste des tickets (Admin) */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} /> Tous les tickets</h3>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
          {loading ? <p>Chargement...</p> : tickets.length === 0 ? (
            <p style={{ color: 'var(--color-neutral-500)', textAlign: 'center' }}>Aucun ticket trouvé.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => loadTicket(t.id)}
                  style={{ 
                    padding: '1rem', 
                    border: `1px solid ${activeTicket?.id === t.id ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`, 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    backgroundColor: activeTicket?.id === t.id ? 'var(--color-primary-50)' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-primary-900)' }}>{t.subject}</strong>
                    {getStatusBadge(t.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
                    De: {t.user?.firstName} {t.user?.lastName} ({t.user?.email})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    <span>{t._count.messages} message(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colonne DǸtail Chat (Admin) */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {!activeTicket && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>SǸlectionnez un ticket pour afficher la conversation</p>
          </div>
        )}

        {activeTicket && (
          <>
            <div style={{ borderBottom: '1px solid var(--color-neutral-200)', padding: '1rem', backgroundColor: 'var(--color-neutral-50)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{activeTicket.subject}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>Client : {activeTicket.user?.firstName} {activeTicket.user?.lastName} ({activeTicket.user?.email})</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(activeTicket.status)}
                  <select 
                    value={activeTicket.status} 
                    onChange={e => handleStatusChange(e.target.value)}
                    className="form-control"
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.85rem' }}
                  >
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTicket.messages.map((msg: any) => {
                const isAdmin = msg.sender.role === 'ADMIN';
                return (
                  <div key={msg.id} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{ 
                      backgroundColor: isAdmin ? 'var(--color-primary-600)' : 'var(--color-neutral-100)', 
                      color: isAdmin ? 'white' : 'var(--color-neutral-900)',
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px',
                      borderBottomRightRadius: isAdmin ? 0 : '8px',
                      borderBottomLeftRadius: !isAdmin ? 0 : '8px'
                    }}>
                      {!isAdmin && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--color-neutral-500)' }}>{msg.sender.firstName} (Client)</div>}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.25rem', textAlign: isAdmin ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-neutral-200)', backgroundColor: 'var(--color-white)' }}>
              <form onSubmit={handleReply} style={{ display: 'flex', gap: '0.5rem' }}>
                <textarea 
                  value={replyMessage} 
                  onChange={e => setReplyMessage(e.target.value)} 
                  className="form-control" 
                  rows={2}
                  placeholder="Écrire une réponse au client..." 
                  style={{ flex: 1, resize: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center' }} disabled={!replyMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
