import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, Settings as SettingsIcon, Mail, Phone, MapPin } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    contactEmail: '',
    contactPhone: '',
    contactAddress: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/settings`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            contactEmail: data.contactEmail || '',
            contactPhone: data.contactPhone || '',
            contactAddress: data.contactAddress || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès !' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-neutral-300)', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: 'var(--color-neutral-700)' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-neutral-800)' }}>Paramètres du site</h1>

      {message && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px', 
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: '500'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
          <SettingsIcon size={24} color="var(--color-primary-600)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-neutral-800)' }}>Coordonnées Publiques de l'Entreprise</h2>
        </div>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Ces informations seront affichées publiquement sur la page de contact et dans le pied de page du site web.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={labelStyle}>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
              Email de contact public
            </label>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} style={inputStyle} placeholder="contact@emeraude-africa.com" />
          </div>
          <div>
            <label style={labelStyle}>
              <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
              Téléphone de contact public
            </label>
            <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} style={inputStyle} placeholder="+33 6 12 34 56 78" />
          </div>
          <div>
            <label style={labelStyle}>
              <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
              Adresse du siège / Bureaux
            </label>
            <textarea name="contactAddress" value={formData.contactAddress} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="123 Avenue des Champs-Elysées..." />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}>
          <Save size={20} />
          {saving ? 'Enregistrement...' : 'Mettre à jour les coordonnées'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
