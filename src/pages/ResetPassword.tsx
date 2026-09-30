import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
        <h2 style={{ color: '#991b1b' }}>Lien invalide</h2>
        <p>Le jeton de réinitialisation est manquant.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Jeton invalide ou expiré.');
      }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Jeton invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
        <h2 style={{ color: '#166534' }}>Mot de passe modifié !</h2>
        <p>Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--color-primary-900)', marginBottom: '1.5rem' }}>Nouveau mot de passe</h2>
      
      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem' }}>
          {loading ? 'Mise à jour...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
