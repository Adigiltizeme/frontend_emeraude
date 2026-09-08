import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, Settings } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>Mon Espace Investisseur</h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-primary-800)', marginBottom: '1rem', fontSize: '1.5rem', marginTop: 0 }}>Bonjour, {user.firstName || user.email} 👋</h2>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.1rem' }}>
          Bienvenue sur votre espace personnel Emeraude Africa. 
          Votre profil est actuellement en cours de vérification par nos équipes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
          <Building2 size={32} color="var(--color-primary-500)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-neutral-800)', marginBottom: '0.5rem', marginTop: 0 }}>Mes Investissements</h3>
          <p style={{ color: 'var(--color-neutral-500)' }}>Vous n'avez pas encore d'investissement actif. Explorez nos projets pour commencer.</p>
          <button onClick={() => navigate('/investir')} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Découvrir les projets</button>
        </div>

        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', opacity: 0.7 }}>
          <FileText size={32} color="var(--color-neutral-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-neutral-800)', marginBottom: '0.5rem', marginTop: 0 }}>Mes Documents</h3>
          <p style={{ color: 'var(--color-neutral-500)' }}>Contrats et rapports financiers apparaitront ici.</p>
          <button className="btn btn-outline" disabled style={{ marginTop: '1.5rem', width: '100%' }}>Bientôt disponible</button>
        </div>

        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
          <Settings size={32} color="var(--color-primary-500)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-neutral-800)', marginBottom: '0.5rem', marginTop: 0 }}>Mon Profil</h3>
          <p style={{ color: 'var(--color-neutral-500)' }}>Gérez vos informations personnelles et vos coordonnées KYC.</p>
          <button onClick={() => navigate('/mon-profil')} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>Modifier mon profil</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
