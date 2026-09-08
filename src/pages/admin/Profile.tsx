import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User as UserIcon, Lock } from 'lucide-react';

const Profile: React.FC = () => {
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const me = await res.json();
          if (me) {
            setFormData(prev => ({
              ...prev,
              firstName: me.firstName || '',
              lastName: me.lastName || '',
              phone: me.phone || '',
              email: me.email || ''
            }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setSaving(true);
    
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email
    };
    
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--color-neutral-800)', margin: '0 0 2rem 0' }}>Mon Profil</h1>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            <UserIcon size={24} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-neutral-800)', margin: 0 }}>Informations Personnelles</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Email (Identifiant)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)', marginTop: '3rem' }}>
            <Lock size={24} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-neutral-800)', margin: 0 }}>Sécurité</h2>
          </div>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} placeholder="••••••••" />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}>
            <Save size={20} />
            {saving ? 'Enregistrement...' : 'Enregistrer mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
