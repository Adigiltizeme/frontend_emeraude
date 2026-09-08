import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminInvestments = () => {
  const { token } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/investments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInvestments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvestments();
  }, [token]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/investments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh
        fetchInvestments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.85rem', fontWeight: 'bold' }}>En attente</span>;
      case 'CONFIRMED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.85rem', fontWeight: 'bold' }}>Validé</span>;
      case 'CANCELLED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 'bold' }}>Refusé</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div>
      <h2 style={{ color: 'var(--color-primary-900)', marginBottom: '2rem' }}>Gestion des Investissements</h2>

      {loading ? (
        <p>Chargement des données...</p>
      ) : investments.length === 0 ? (
        <p>Aucun investissement trouvé.</p>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Investisseur</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Projet</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Montant</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Statut</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500', color: '#0f172a' }}>{inv.user.firstName} {inv.user.lastName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{inv.user.email}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{inv.user.phone}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '500' }}>{inv.project.title}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>{inv.amount.toLocaleString()} FCFA</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{renderStatus(inv.status)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {inv.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => updateStatus(inv.id, 'CONFIRMED')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <CheckCircle size={16} /> Valider
                        </button>
                        <button 
                          onClick={() => updateStatus(inv.id, 'CANCELLED')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <XCircle size={16} /> Refuser
                        </button>
                      </div>
                    )}
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

export default AdminInvestments;
