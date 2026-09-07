import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import ProjectDetails from '../ProjectDetails';

const CreateProject = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [showPreview, setShowPreview] = useState(false);

  // States du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [target, setTarget] = useState(100000000);
  const [returnRate, setReturnRate] = useState(8);
  const [duration, setDuration] = useState(24);
  const [minTicket, setMinTicket] = useState(10000);
  const [riskLevel, setRiskLevel] = useState('Modéré');
  const [assetType, setAssetType] = useState('Résidentiel');
  const [rentYield, setRentYield] = useState(5.5);
  const [capitalGain, setCapitalGain] = useState(2.5);
  const [guarantee, setGuarantee] = useState('Hypothèque de 1er rang');
  
  const distribution = 'Trimestrielle';
  const [impact, setImpact] = useState('');

  // Fichier image
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const projectResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, location,
          target: Number(target), returnRate: Number(returnRate),
          duration: Number(duration), minTicket: Number(minTicket),
          riskLevel, assetType, rentYield: Number(rentYield),
          capitalGain: Number(capitalGain), guarantee, distribution, impact, status
        })
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
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Informations de base */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', color: 'var(--color-primary-900)', fontSize: '1.25rem' }}>{t('admin.projectForm.tabGeneral')}</h3>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder={t('admin.projectForm.titlePlaceholder')} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.location')}</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder={t('admin.projectForm.locationPlaceholder')} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.assetType')}</label>
              <select value={assetType} onChange={e => setAssetType(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="Résidentiel">{t('admin.projectForm.assetResidential')}</option>
                <option value="Commercial">{t('admin.projectForm.assetCommercial')}</option>
                <option value="Mixte">{t('admin.projectForm.assetMixed')}</option>
                <option value="Hôtellerie">{t('admin.projectForm.assetHotel')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.status')}</label>
              <select value={status} onChange={e => setStatus(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="DRAFT">Brouillon (DRAFT)</option>
                <option value="COLLECTING">En collecte (COLLECTING)</option>
                <option value="FUNDED">Financé (FUNDED)</option>
                <option value="COMPLETED">Réalisé (COMPLETED)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Description détaillée</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} placeholder="Décrivez le projet, ses atouts, son emplacement..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
          </div>
        </div>

        {/* Chiffres clés */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', color: '#0f172a', fontSize: '1.25rem' }}>{t('admin.projectForm.tabFinancial')}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.target')}</label>
              <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.minTicket')}</label>
              <input type="number" value={minTicket} onChange={e => setMinTicket(Number(e.target.value))} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.duration')}</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.returnRate')}</label>
              <input type="number" step="0.1" value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
          </div>
        </div>

        {/* Structuration Financière */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', color: '#0f172a', fontSize: '1.25rem' }}>{t('admin.projectForm.tabStructure')}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.rentYield')}</label>
              <input type="number" step="0.1" value={rentYield} onChange={e => setRentYield(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.capitalGain')}</label>
              <input type="number" step="0.1" value={capitalGain} onChange={e => setCapitalGain(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.guarantee')}</label>
              <input type="text" value={guarantee} onChange={e => setGuarantee(e.target.value)} placeholder={t('admin.projectForm.guaranteePlaceholder')} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.riskLevel')}</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}>
                <option value="Très Faible">{t('admin.projectForm.riskLow')}</option>
                <option value="Faible">{t('admin.projectForm.riskLow')}</option>
                <option value="Modéré">{t('admin.projectForm.riskModerate')}</option>
                <option value="Élevé">{t('admin.projectForm.riskHigh')}</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.impact')}</label>
            <input type="text" value={impact} onChange={e => setImpact(e.target.value)} placeholder={t('admin.projectForm.impactPlaceholder')} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
          </div>
        </div>



        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-neutral-800)' }}>{t('admin.projectForm.descFull')}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} placeholder={t('admin.projectForm.descPlaceholder')} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', fontSize: '1rem', resize: 'vertical', outline: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--color-primary-500)'} onBlur={e => e.target.style.borderColor = 'var(--color-neutral-300)'}></textarea>
        </div>


        {/* Média */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', color: '#0f172a', fontSize: '1.25rem' }}>{t('admin.projectForm.tabMedia')}</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>{t('admin.projectForm.photoLabel')}</label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <label style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary-600)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                  {t('admin.projectForm.chooseFile')}
                  <input type="file" accept="image/*" onChange={e => e.target.files && setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <span style={{ color: '#475569' }}>{imageFile ? imageFile.name : t('admin.projectForm.noFileChosen')}</span>
              </div>
              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{t('admin.projectForm.photoHint')}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {loading ? t('admin.projectForm.btnCreating') : t('admin.projectForm.btnCreate')}
          </button>
          <button type="button" onClick={() => setShowPreview(true)} className="btn btn-outline" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            👀 {t('admin.projectForm.btnPreview')}
          </button>
        </div>
      </form>

      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, overflowY: 'auto' }}>
          <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary-900)' }}>{t('admin.projectForm.previewMode')}</h3>
              <button onClick={() => setShowPreview(false)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={20} /> {t('admin.projectForm.closePreview')}
              </button>
            </div>
            <ProjectDetails
              isPreview={true}
              previewData={{
                title, description, location, target, returnRate, duration, minTicket, riskLevel, assetType, status,
                image: imageFile ? URL.createObjectURL(imageFile) : undefined
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
