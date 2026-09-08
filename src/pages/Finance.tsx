import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Finance = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    location: 'Sénégal',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour soumettre un projet.");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        alert(err.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
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
        {!isAuthenticated && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '8px', marginTop: '1.5rem', display: 'inline-block' }}>
            ⚠️ Vous devez créer un compte "Porteur de projet" pour soumettre un dossier.
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Titre du projet</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Construction d'une résidence écologique..." 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelCountry')}</label>
              <select name="location" value={formData.location} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)', backgroundColor: 'white' }}>
                <option value="Sénégal">{t('finance.countrySenegal')}</option>
                <option value="Côte d'Ivoire">{t('finance.countryCI')}</option>
                <option value="Autre">{t('finance.countryOther')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelTarget')} (FCFA)</label>
              <input 
                type="number" 
                name="target"
                required
                value={formData.target}
                onChange={handleChange}
                placeholder="Ex: 50000000" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelDesc')}</label>
            <textarea 
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={6} 
              placeholder="Décrivez votre projet, vos objectifs, et ce que vous attendez du financement..." 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }}></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            {loading ? 'Envoi en cours...' : t('finance.btnSubmit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Finance;
