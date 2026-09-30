import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setMessage(data.message || 'Si un compte existe, un email a été envoyé.');
    } catch (err) {
      setError('Une erreur est survenue lors de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--color-primary-900)', marginBottom: '1.5rem' }}>Mot de passe oublié</h2>
      
      {message && <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Adresse E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem' }}>
          {loading ? 'Envoi en cours...' : 'Recevoir le lien'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/login" style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}>Retour à la connexion</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
