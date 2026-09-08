import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: any, imageFile: File | null) => Promise<void>;
  onPreview?: (data: any) => void;
  submitLabel: string;
  showStatus?: boolean; // Pour l'admin
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, onPreview, submitLabel, showStatus = false }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Sénégal',
    target: '',
    returnRate: '',
    duration: '',
    minTicket: '',
    riskLevel: 'Modéré',
    assetType: 'Résidentiel',
    rentYield: '',
    capitalGain: '',
    guarantee: 'Hypothèque de 1er rang',
    distribution: 'Trimestrielle',
    impact: '',
    status: 'DRAFT'
  });

  const [customLocation, setCustomLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        location: ['Sénégal', "Côte d'Ivoire"].includes(initialData.location) ? initialData.location : 'Autre',
        target: initialData.target || '',
        returnRate: initialData.returnRate || '',
        duration: initialData.duration || '',
        minTicket: initialData.minTicket || '',
        riskLevel: initialData.riskLevel || 'Modéré',
        assetType: initialData.assetType || 'Résidentiel',
        rentYield: initialData.rentYield || '',
        capitalGain: initialData.capitalGain || '',
        guarantee: initialData.guarantee || '',
        distribution: initialData.distribution || 'Trimestrielle',
        impact: initialData.impact || '',
        status: initialData.status || 'DRAFT'
      });
      if (!['Sénégal', "Côte d'Ivoire"].includes(initialData.location)) {
        setCustomLocation(initialData.location || '');
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const finalData = {
      ...formData,
      location: formData.location === 'Autre' ? customLocation : formData.location,
      target: Number(formData.target),
      returnRate: Number(formData.returnRate),
      duration: Number(formData.duration),
      minTicket: Number(formData.minTicket),
      rentYield: formData.rentYield ? Number(formData.rentYield) : null,
      capitalGain: formData.capitalGain ? Number(formData.capitalGain) : null,
    };

    try {
      await onSubmit(finalData, imageFile);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)', backgroundColor: 'white' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-neutral-800)' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {showStatus && (
        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={labelStyle}>Statut du projet</label>
          <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
            <option value="DRAFT">Brouillon (DRAFT)</option>
            <option value="SUBMITTED">Soumis par un porteur (SUBMITTED)</option>
            <option value="COLLECTING">En collecte (COLLECTING)</option>
            <option value="FUNDED">Financé (FUNDED)</option>
            <option value="COMPLETED">Terminé (COMPLETED)</option>
          </select>
        </div>
      )}

      {/* SECTION 1: INFORMATIONS DE BASE */}
      <div>
        <h3 style={{ borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary-800)' }}>Informations de base</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Titre du projet *</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Ex: Construction d'une résidence..." style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Pays du projet *</label>
            <select name="location" value={formData.location} onChange={handleChange} style={inputStyle}>
              <option value="Sénégal">{t('finance.countrySenegal', 'Sénégal')}</option>
              <option value="Côte d'Ivoire">{t('finance.countryCI', "Côte d'Ivoire")}</option>
              <option value="Autre">{t('finance.countryOther', 'Autre')}</option>
            </select>
            {formData.location === 'Autre' && (
              <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Veuillez préciser le pays" required style={{ ...inputStyle, marginTop: '0.5rem' }} />
            )}
          </div>
          <div>
            <label style={labelStyle}>Type d'actif *</label>
            <select name="assetType" value={formData.assetType} onChange={handleChange} style={inputStyle}>
              <option value="Résidentiel">Résidentiel</option>
              <option value="Commercial">Commercial</option>
              <option value="Industriel">Industriel</option>
              <option value="Agricole">Agricole</option>
              <option value="Mixte">Mixte</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description détaillée *</label>
          <textarea name="description" required value={formData.description} onChange={handleChange} rows={6} placeholder="Décrivez votre projet..." style={inputStyle}></textarea>
        </div>
      </div>

      {/* SECTION 2: DONNÉES FINANCIÈRES */}
      <div>
        <h3 style={{ borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary-800)' }}>Données Financières</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Montant recherché (FCFA) *</label>
            <input type="number" name="target" required value={formData.target} onChange={handleChange} placeholder="Ex: 50000000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ticket minimum (FCFA) *</label>
            <input type="number" name="minTicket" required value={formData.minTicket} onChange={handleChange} placeholder="Ex: 100000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Durée estimée (mois) *</label>
            <input type="number" name="duration" required value={formData.duration} onChange={handleChange} placeholder="Ex: 12" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Rendement cible (%) *</label>
            <input type="number" name="returnRate" step="0.1" required value={formData.returnRate} onChange={handleChange} placeholder="Ex: 8.5" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Niveau de risque *</label>
            <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} style={inputStyle}>
              <option value="Faible">Faible</option>
              <option value="Modéré">Modéré</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fréquence de distribution</label>
            <select name="distribution" value={formData.distribution} onChange={handleChange} style={inputStyle}>
              <option value="Mensuelle">Mensuelle</option>
              <option value="Trimestrielle">Trimestrielle</option>
              <option value="Annuelle">Annuelle</option>
              <option value="À l'échéance">À l'échéance</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: EXTRAS & MEDIA */}
      <div>
        <h3 style={{ borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-primary-800)' }}>Informations complémentaires</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Garantie proposée</label>
            <input type="text" name="guarantee" value={formData.guarantee} onChange={handleChange} placeholder="Ex: Hypothèque de 1er rang" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Impact économique/social</label>
            <input type="text" name="impact" value={formData.impact} onChange={handleChange} placeholder="Ex: Création de 40 emplois" style={inputStyle} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Rendement Locatif (%)</label>
            <input type="number" step="0.1" name="rentYield" value={formData.rentYield} onChange={handleChange} placeholder="Ex: 5.5" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Plus-value estimée (%)</label>
            <input type="number" step="0.1" name="capitalGain" value={formData.capitalGain} onChange={handleChange} placeholder="Ex: 2.5" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Photo d'illustration principale</label>
          <div style={{ border: '2px dashed var(--color-neutral-300)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
            <Upload size={32} color="var(--color-neutral-400)" style={{ margin: '0 auto 1rem' }} />
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', margin: '0 auto' }} />
            {imageFile && <p style={{ marginTop: '1rem', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>Image sélectionnée : {imageFile.name}</p>}
            {initialData?.image && !imageFile && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-neutral-600)', marginBottom: '0.5rem', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                  Image actuelle : {initialData.image.substring(0, 40)}...
                </p>
                {initialData.image.startsWith('http') && (
                  <img src={initialData.image} alt="Actuelle" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {onPreview && (
          <button 
            type="button" 
            onClick={() => onPreview(formData)} 
            className="btn btn-outline" 
            style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
          >
            Aperçu du projet
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary" 
          style={{ flex: 2, padding: '1rem', fontSize: '1.1rem' }}
        >
          {loading ? 'Traitement...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
