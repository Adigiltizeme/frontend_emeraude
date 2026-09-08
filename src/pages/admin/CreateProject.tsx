import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectForm from '../../components/ProjectForm';
import ProjectDetails from '../ProjectDetails';
import { X } from 'lucide-react';

const CreateProject = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleSubmit = async (projectData: any, imageFile: File | null) => {
    setError('');

    try {
      const projectResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (!projectResponse.ok) {
        throw new Error('Erreur de création');
      }

      const newProject = await projectResponse.json();

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const imageResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${newProject.id}/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!imageResponse.ok) throw new Error('Erreur image');
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto', backgroundColor: 'var(--color-neutral-100)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '2rem', marginBottom: '0.5rem' }}>{t('admin.projectForm.createTitle')}</h1>
          <p style={{ color: '#475569' }}>{t('admin.projectForm.createSubtitle')}</p>
        </div>
        <button onClick={() => navigate('/admin')} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          {t('admin.projectForm.backDashboard')}
        </button>
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>{error}</div>}

      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <ProjectForm 
          onSubmit={handleSubmit}
          onPreview={(data) => { setPreviewData(data); setShowPreview(true); }}
          submitLabel={t('admin.projectForm.btnCreate', 'Créer le projet')}
          showStatus={true}
        />
      </div>
      
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '1200px', margin: '0 auto', borderRadius: '12px', position: 'relative' }}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
              <X size={24} />
            </button>
            <div style={{ pointerEvents: 'none' }}>
              <ProjectDetails isPreview={true} previewData={previewData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
