import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fieldStyle, labelStyle } from '../../config/formStyles';

/** Profils d'administrateur (mêmes valeurs que l'API : src/auth/permissions.ts). */
const ADMIN_ROLES = ['SUPER_ADMIN', 'COMPLIANCE', 'FINANCE', 'SUPPORT', 'EDITOR'];

const EditUser: React.FC = () => {
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token, user: currentUser } = useAuth();
  const { t } = useTranslation();
  // Rôles modifiables seulement avec la permission « admins » (super-administrateur).
  const canManageRoles = !currentUser?.permissions || currentUser.permissions.includes('admins');
  const [original, setOriginal] = useState({ role: 'USER', adminRole: 'SUPER_ADMIN' });
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    intention: '',
    role: 'USER',
    adminRole: 'SUPER_ADMIN'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || currentUser?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const users = await res.json();
          const userToEdit = users.find((u: any) => u.id === id);
          if (userToEdit) {
            setFormData({
              firstName: userToEdit.firstName || '',
              lastName: userToEdit.lastName || '',
              phone: userToEdit.phone || '',
              intention: userToEdit.intention || '',
              role: userToEdit.role || 'USER',
              adminRole: userToEdit.adminRole || 'SUPER_ADMIN'
            });
            setOriginal({ role: userToEdit.role || 'USER', adminRole: userToEdit.adminRole || 'SUPER_ADMIN' });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, token, currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Promotion : profil le plus restreint par défaut (jamais super-administrateur sans choix explicite).
    if (name === 'role' && value === 'ADMIN' && original.role !== 'ADMIN') {
      setFormData(prev => ({ ...prev, role: value, adminRole: 'EDITOR' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // Rôle et profil envoyés seulement s'ils changent.
    const { role, adminRole, ...profile } = formData;
    const payload: Record<string, unknown> = { ...profile };
    if (role !== original.role) payload.role = role;
    if (role === 'ADMIN' && (adminRole !== original.adminRole || role !== original.role)) payload.adminRole = adminRole;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/auth/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/admin/users');
      } else {
        const data = await res.json().catch(() => ({}));
        const text = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        setError(text ? String(text).replace(/^PERMISSION_DENIED: /, '') : 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button 
        onClick={() => navigate('/admin/users')}
        className="btn btn-outline"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={20} />
        Retour à la liste
      </button>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Modifier l'Utilisateur</h1>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Prénom</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Nom</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Téléphone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }} />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Intention d'investissement</label>
          <select name="intention" value={formData.intention} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a' }}>
            <option value="">Non renseigné</option>
            <option value="Investissement">Investissement</option>
            <option value="Porteur de projet">Porteur de projet</option>
            <option value="Demande de renseignements">Demande de renseignements</option>
          </select>
        </div>

        {canManageRoles && (
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Rôle Système</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 'bold' }}>
              <option value="USER">Utilisateur Standard</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
        )}

        {canManageRoles && formData.role === 'ADMIN' && (
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="admin-role" style={labelStyle}>{t('adminRoles.label')}</label>
            <select id="admin-role" name="adminRole" value={formData.adminRole} onChange={handleChange} style={fieldStyle}>
              {ADMIN_ROLES.map((r) => <option key={r} value={r}>{t(`adminRoles.${r}`)}</option>)}
            </select>
            <small style={{ display: 'block', color: 'var(--color-neutral-500)', marginTop: '0.35rem' }}>{t(`adminRoles.desc.${formData.adminRole}`)}</small>
          </div>
        )}

        {error && <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={20} />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
};

export default EditUser;
