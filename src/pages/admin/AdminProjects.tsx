import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import ProjectDetails from '../ProjectDetails';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState<any>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects`);
      if (res.ok) {
        const data = await res.json();
        // Filtrer pour ne garder que les projets soumis par des utilisateurs (Porteurs de projets)
        const userProjects = data.filter((p: any) => p.owner !== null && p.owner !== undefined);
        setProjects(userProjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.dashboard.confirmDelete', 'Êtes-vous sûr de vouloir supprimer ce projet ?'))) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProjects(projects.filter(p => p.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchProjects(); // Rafraichir la liste
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>Brouillon</span>;
      case 'SUBMITTED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.85rem', fontWeight: 'bold' }}>En attente</span>;
      case 'COLLECTING': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.85rem', fontWeight: 'bold' }}>En collecte</span>;
      case 'FUNDED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold' }}>Financé</span>;
      case 'COMPLETED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f3e8ff', color: '#9333ea', fontSize: '0.85rem', fontWeight: 'bold' }}>Terminé</span>;
      case 'CANCELLED': return <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 'bold' }}>Refusé</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>Dossiers Porteurs de Projets</h1>

      </div>

      <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-600)' }}>Aucun projet trouvé.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Porteur de projet</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Titre du Projet</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Cible (FCFA)</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Statut</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    
                    <td style={{ padding: '1rem' }}>
                      {project.owner ? (
                        <>
                          <div style={{ fontWeight: '500', color: '#0f172a' }}>{project.owner.firstName} {project.owner.lastName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.owner.email}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.owner.phone}</div>
                        </>
                      ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Équipe Emeraude</div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '500' }}>{project.title}</td>
                    
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>
                      {project.target?.toLocaleString() || 0}
                    </td>

                    <td style={{ padding: '1rem', color: '#475569' }}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td style={{ padding: '1rem' }}>{renderStatus(project.status)}</td>
                    
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        
                        {project.status === 'SUBMITTED' && (
                          <>
                            <button 
                              onClick={() => updateStatus(project.id, 'COLLECTING')}
                              title="Valider et passer en collecte"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                              <CheckCircle size={16} /> Valider
                            </button>
                            <button 
                              onClick={() => updateStatus(project.id, 'CANCELLED')}
                              title="Refuser le dossier"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                              <XCircle size={16} /> Refuser
                            </button>
                          </>
                        )}
                        
                        <button onClick={() => { setPreviewProject(project); setShowPreview(true); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }} title="Aperçu public">
                          <Eye size={20} />
                        </button>
                        
                        <button onClick={() => navigate(`/admin/projects/edit/${project.id}`)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '0.25rem' }} title="Modifier">
                          <Edit size={20} />
                        </button>
                        
                        <button onClick={() => handleDelete(project.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }} title="Supprimer">
                          <Trash2 size={20} />
                        </button>
                        
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showPreview && previewProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '1200px', margin: '0 auto', borderRadius: '12px', position: 'relative' }}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
              <X size={24} />
            </button>
            <div style={{ pointerEvents: 'none' }}>
              <ProjectDetails isPreview={true} previewData={previewProject} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
