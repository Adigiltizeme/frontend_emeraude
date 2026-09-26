import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Plus, Send, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const UserSupport: React.FC = () => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
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
        setShowNewTicket(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/support/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ subject: newSubject, message: newMessage })
      });
      if (res.ok) {
        setNewSubject('');
        setNewMessage('');
        setShowNewTicket(false);
        fetchTickets();
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><AlertCircle size={14} /> Ouvert</span>;
      case 'IN_PROGRESS': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><Clock size={14} /> En cours</span>;
      case 'RESOLVED': return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}><CheckCircle size={14} /> Résolu</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      {/* Colonne Liste des tickets */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--color-neutral-200)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} /> Mes demandes</h3>
          <button 
            onClick={() => { setShowNewTicket(true); setActiveTicket(null); }}
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Nouveau ticket
          </button>
        </div>

        {loading ? <p>Chargement...</p> : tickets.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-500)', textAlign: 'center', padding: '2rem 0' }}>Aucune demande de support pour le moment.</p>
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
                <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  <span>{t._count.messages} message(s)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colonne DǸtail / Nouveau Ticket */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
        
        {!showNewTicket && !activeTicket && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>SǸlectionnez un ticket ou crǸez-en un nouveau</p>
          </div>
        )}

        {showNewTicket && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Nouveau ticket de support</h3>
              <button onClick={() => setShowNewTicket(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sujet</label>
                <input required type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="form-control" placeholder="Quel est votre problme ?" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message</label>
                <textarea required value={newMessage} onChange={e => setNewMessage(e.target.value)} className="form-control" rows={5} placeholder="DǸcrivez votre demande en dǸtail..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Envoyer la demande</button>
            </form>
          </div>
        )}

        {activeTicket && !showNewTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{activeTicket.subject}</h3>
                {getStatusBadge(activeTicket.status)}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)' }}>Ouvert le {new Date(activeTicket.createdAt).toLocaleString()}</span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', paddingRight: '0.5rem' }}>
              {activeTicket.messages.map((msg: any) => {
                const isMe = msg.sender.id === user?.id;
                const isAdmin = msg.sender.role === 'ADMIN';
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{ 
                      backgroundColor: isMe ? 'var(--color-primary-600)' : isAdmin ? '#f1f5f9' : 'var(--color-neutral-100)', 
                      color: isMe ? 'white' : 'var(--color-neutral-900)',
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px',
                      borderBottomRightRadius: isMe ? 0 : '8px',
                      borderBottomLeftRadius: !isMe ? 0 : '8px'
                    }}>
                      {!isMe && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', color: isAdmin ? 'var(--color-primary-700)' : 'var(--color-neutral-500)' }}>{isAdmin ? 'Support Emeraude' : msg.sender.firstName}</div>}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeTicket.status !== 'RESOLVED' && (
              <form onSubmit={handleReply} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <input 
                  type="text" 
                  value={replyMessage} 
                  onChange={e => setReplyMessage(e.target.value)} 
                  className="form-control" 
                  placeholder="Écrire une réponse..." 
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center' }} disabled={!replyMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            )}
            {activeTicket.status === 'RESOLVED' && (
              <div style={{ textAlign: 'center', color: 'var(--color-neutral-500)', padding: '1rem', backgroundColor: 'var(--color-neutral-50)', borderRadius: '4px', marginTop: 'auto' }}>
                Ce ticket a été marqué comme résolu.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
