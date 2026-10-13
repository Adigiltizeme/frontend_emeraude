import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import ProjectForm from '../components/ProjectForm';
import { usePageMeta } from '../hooks/usePageMeta';
import { useSiteSettings } from '../context/SettingsContext';
import { formatMoney } from '../config/api';
import { uploadProjectDocuments } from '../lib/projectUploads';
import type { ProjectDocuments } from '../components/ProjectForm';

const Finance = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  usePageMeta(t('finance.title'), t('finance.subtitle'));
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (projectData: any, imageFile: File | null, documents?: ProjectDocuments) => {
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour soumettre un projet.");
      navigate('/login');
      return;
    }

    setErrorMsg('');
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(projectData)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(String(err.message || '').startsWith('EMAIL_NOT_VERIFIED') ? t('payment.errors.emailNotVerified') : err.message || 'Erreur lors de la création du projet');
      }
      
      const createdProject = await res.json();

      if (imageFile && createdProject.id) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${createdProject.id}/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: imageFormData
        });
        
        if (!uploadRes.ok) {
          console.warn("Le projet a été créé mais l'image n'a pas pu être uploadée.");
        }
      }

      // Brochure et documentation légale (facultatives).
      await uploadProjectDocuments(createdProject.id, token, documents);
      setSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur de connexion au serveur');
      throw error;
    }
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', textAlign: 'center' }}>
        <div style={{ padding: '3rem', backgroundColor: '#dcfce7', borderRadius: '12px', border: '1px solid #16a34a' }}>
          <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ color: '#15803d', marginBottom: '1rem' }}>Projet soumis avec succès !</h1>
          <p style={{ color: '#166534', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Notre équipe d'analystes va étudier votre dossier. Vous pouvez suivre l'avancement depuis votre tableau de bord.
          </p>
          <button onClick={() => navigate('/mon-compte')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Aller à mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>{t('finance.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem' }}>
          {t('finance.subtitle')}
        </p>
        <div style={{ marginTop: '1.5rem', backgroundColor: 'var(--color-primary-50)', borderRadius: '8px', padding: '1rem', textAlign: 'left', fontSize: '0.95rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{t('finance.feesTitle')}</strong>
          <div>{settings.projectSubmissionFee > 0 ? t('finance.feesSubmission', { fee: formatMoney(settings.projectSubmissionFee, i18n.language) }) : t('finance.feesSubmissionFree')}</div>
          <div>{settings.projectCommissionPercent > 0 ? t('finance.feesCommission', { percent: settings.projectCommissionPercent }) : t('finance.feesNoCommission')}</div>
        </div>

      </div>

      {isAuthenticated ? (
        <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              {errorMsg}
            </div>
          )}
          
          <ProjectForm 
            onSubmit={handleSubmit} 
            submitLabel="Soumettre le projet pour validation" 
            showStatus={false}
          />
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-white)', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-primary-900)', marginBottom: '1rem' }}>Prêt à financer votre projet ?</h2>
          <p style={{ color: 'var(--color-neutral-600)', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Rejoignez notre plateforme pour soumettre votre dossier à nos analystes et lever des fonds auprès de notre communauté d'investisseurs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/inscription')} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Créer un compte
            </button>
            <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
              Se connecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
