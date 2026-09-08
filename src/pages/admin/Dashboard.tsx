import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.dashboard.confirmDelete'))) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          setProjects(projects.filter(p => p.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>Projets</h1>
        <button onClick={() => navigate('/admin/projects/new')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> {t('admin.dashboard.newProject')}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.dashboard.loading')}</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-600)' }}>{t('admin.dashboard.noProjects')}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-neutral-100)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-neutral-700)' }}>{t('admin.dashboard.tableTitle')}</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-neutral-700)' }}>{t('admin.dashboard.tableStatus')}</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--color-neutral-700)' }}>{t('admin.dashboard.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{project.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: project.status === 'COMPLETED' ? '#dcfce7' : project.status === 'FUNDED' ? '#dbeafe' : project.status === 'COLLECTING' ? '#fef9c3' : '#f1f5f9',
                      color: project.status === 'COMPLETED' ? '#166534' : project.status === 'FUNDED' ? '#1e40af' : project.status === 'COLLECTING' ? '#854d0e' : '#475569'
                    }}>
                      {t(`admin.status.${project.status}`)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link to={`/admin/projects/edit/${project.id}`} style={{ display: 'inline-flex', padding: '0.5rem', color: 'var(--color-primary-600)', textDecoration: 'none', marginRight: '0.5rem' }}>
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(project.id)} style={{ padding: '0.5rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
