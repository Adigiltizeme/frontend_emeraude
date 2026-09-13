import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Mail, Phone, Calendar, User as UserIcon, Edit, Trash2, Eye, Search, Filter, Download , ShieldCheck, ShieldAlert, Check, X as XIcon, FileText } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  intention: string | null;
  role: string;
  createdAt: string;
  kycStatus?: string;
  idDocumentUrl?: string;
  _count?: {
    investments: number;
    ownedProjects: number;
  };
}

const ManageUsers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [intentionFilter, setIntentionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate, token, user]);

  const handleKycStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users/${id}/kyc`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, kycStatus: status } : u)); if (selectedUser && selectedUser.id === id) setSelectedUser({ ...selectedUser, kycStatus: status });
      }
    } catch(err) {
      alert("Erreur réseau");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${name} ?`)) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch(err) {
        alert("Erreur réseau");
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Intention', 'Rôle', 'Date inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => [
        `"${u.lastName || ''}"`,
        `"${u.firstName || ''}"`,
        `"${u.email}"`,
        `"${u.phone || ''}"`,
        `"${u.intention || 'Non renseigné'}"`,
        `"${u.role}"`,
        `"${new Date(u.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'emeraude_utilisateurs.csv';
    link.click();
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        (u.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchIntention = intentionFilter === 'ALL' || u.intention === intentionFilter;
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchIntention && matchRole;
    });
  }, [users, searchTerm, intentionFilter, roleFilter]);

  // Fixed intentions list to show all options even if no user has them yet
  const ALL_INTENTIONS = [
    "Investissement",
    "Porteur de projet",
    "Demande de renseignements"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} />
          {t('admin.projectForm.backDashboard')}
        </button>
        <button onClick={exportToCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Exporter CSV
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-neutral-800)' }}>{t('admin.manageUsers.title')}</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>{filteredUsers.length} utilisateur(s) trouvé(s)</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input 
              type="text" 
              placeholder="Rechercher (Nom, Email)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', outline: 'none', width: '250px', backgroundColor: '#f8fafc', color: 'var(--color-neutral-700)' }}
            />
          </div>

          {/* Intention Filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <select 
              value={intentionFilter} 
              onChange={(e) => setIntentionFilter(e.target.value)}
              style={{ padding: '0.6rem 2rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', appearance: 'auto', color: 'var(--color-neutral-700)', fontWeight: '500' }}
            >
              <option value="ALL">Toutes les intentions</option>
              {ALL_INTENTIONS.map(int => (
                <option key={int} value={int}>{int}</option>
              ))}
              <option value="">Non renseigné</option>
            </select>
          </div>

          {/* Role Filter */}
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', color: 'var(--color-neutral-700)', fontWeight: '500' }}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-neutral-500)' }}>{t('admin.manageUsers.loading')}</div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-100)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600', minWidth: '200px' }}>{t('admin.manageUsers.colName')}</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600', minWidth: '250px' }}>{t('admin.manageUsers.colContact')}</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600', minWidth: '180px' }}>Statut / Activité</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600' }}>{t('admin.manageUsers.colRole')}</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600' }}>{t('admin.manageUsers.colDate')}</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600' }}>KYC</th>
                <th style={{ padding: '1rem', color: 'var(--color-neutral-600)', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.firstName ? u.firstName[0].toUpperCase() : <UserIcon size={18} />}
                      </div>
                      <div>
                        <div>{u.firstName || ''} {u.lastName || ''}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>ID: {u.id.substring(0,8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Mail size={14} color="var(--color-neutral-400)" />
                        <a href={`mailto:${u.email}`} style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}>{u.email}</a>
                      </div>
                      {u.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <Phone size={14} color="var(--color-neutral-400)" />
                          <a href={`tel:${u.phone}`} style={{ color: 'var(--color-neutral-700)', textDecoration: 'none' }}>{u.phone}</a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: u.intention ? 'var(--color-primary-50)' : 'var(--color-neutral-100)', 
                      color: u.intention ? 'var(--color-primary-700)' : 'var(--color-neutral-500)', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {u.intention || t('admin.manageUsers.notProvided')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: u.role === 'ADMIN' ? '#fee2e2' : '#f1f5f9', 
                      color: u.role === 'ADMIN' ? '#991b1b' : '#475569', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="var(--color-neutral-400)" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.kycStatus === 'VERIFIED' && <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={14} /> Vérifié</span>}
                    {u.kycStatus === 'REJECTED' && <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ShieldAlert size={14} /> Refusé</span>}
                    {u.kycStatus === 'UNVERIFIED' && <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>Non vérifié</span>}
                    {(!u.kycStatus || u.kycStatus === 'PENDING') && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {u.idDocumentUrl ? (
                          <>
                            {u.idDocumentUrl.split(',').map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }} title={`Doc ${i+1}`}><FileText size={16} /></a>
                            ))}
                            <button onClick={() => handleKycStatus(u.id, 'VERIFIED')} style={{ border: 'none', background: '#16a34a', color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '0.2rem', marginLeft: '0.5rem' }} title="Valider"><Check size={16} /></button>
                            <button onClick={() => handleKycStatus(u.id, 'REJECTED')} style={{ border: 'none', background: '#dc2626', color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '0.2rem' }} title="Refuser"><XIcon size={16} /></button>
                          </>
                        ) : (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.8rem', fontWeight: 'bold' }}>En attente (sans doc)</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setSelectedUser(u)} className="btn btn-outline" title="Voir les détails" style={{ padding: '0.5rem', color: 'var(--color-primary-600)', borderColor: 'var(--color-primary-200)' }}>
                        <Eye size={16} /></button><button onClick={() => navigate(`/admin/users/edit/${u.id}`)} className="btn btn-outline" title="Modifier" style={{ padding: "0.5rem", color: "var(--color-primary-600)", borderColor: "var(--color-primary-200)" }}><Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.firstName || u.email)} className="btn btn-outline" title="Supprimer" style={{ padding: '0.5rem', color: 'var(--color-red-600)', borderColor: 'var(--color-red-200)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                    {t('admin.manageUsers.noUsers')} ou aucune correspondance avec vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de détails utilisateur */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedUser(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--color-neutral-800)' }}>Profil Utilisateur</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-500)' }}><XIcon size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Infos */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-700)', marginBottom: '1rem' }}>Informations personnelles</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><strong>Nom complet:</strong> {selectedUser.firstName} {selectedUser.lastName}</li>
                  <li><strong>Email:</strong> {selectedUser.email}</li>
                  <li><strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}</li>
                  <li><strong>Rôle:</strong> {selectedUser.role}</li>
                  <li><strong>Intention:</strong> {selectedUser.intention || 'Non renseignée'}</li>
                  <li><strong>Inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</li>
                </ul>
              </div>
              
              {/* Activité */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-700)', marginBottom: '1rem' }}>Activité sur la plateforme</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{selectedUser._count?.investments || 0}</div>
                    <div style={{ fontSize: '0.85rem', color: '#15803d' }}>Investissements</div>
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{selectedUser._count?.ownedProjects || 0}</div>
                    <div style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>Projets soumis</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-neutral-800)', marginTop: 0, marginBottom: '1rem' }}>Statut KYC</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  {selectedUser.kycStatus === 'VERIFIED' && <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={18} /> Identité Vérifiée</span>}
                  {selectedUser.kycStatus === 'REJECTED' && <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={18} /> Document Refusé</span>}
                  {selectedUser.kycStatus === 'UNVERIFIED' && <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 'bold' }}>Non vérifié</span>}
                  {(!selectedUser.kycStatus || selectedUser.kycStatus === 'PENDING') && selectedUser.idDocumentUrl && <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }}>En attente de validation</span>}
                  {(!selectedUser.kycStatus || selectedUser.kycStatus === 'PENDING') && !selectedUser.idDocumentUrl && <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }}>En attente (sans document)</span>}
                </div>
                
                {selectedUser.idDocumentUrl && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedUser.idDocumentUrl.split(',').map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} /> Doc {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
