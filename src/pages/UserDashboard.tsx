import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, Settings, Lightbulb, Clock, CheckCircle, XCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isProjectOwner = user?.intention === 'Porteur de projet';
  const dashboardTitle = isProjectOwner ? 'Mon Espace Porteur de Projet' : 'Mon Espace Investisseur';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isProjectOwner) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/my-projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setProjects(await res.json());
        } else {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/investments/my-investments`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setInvestments(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, isProjectOwner]);

  if (!user) return null;

  const renderStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontSize: '0.875rem', fontWeight: '600' }}><Clock size={16} /> En attente</span>;
      case 'CONFIRMED': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: '600' }}><CheckCircle size={16} /> Validé</span>;
      case 'CANCELLED': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}><XCircle size={16} /> Refusé</span>;
      case 'SUBMITTED': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontSize: '0.875rem', fontWeight: '600' }}><Clock size={16} /> En cours d'étude</span>;
      case 'COLLECTING': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb', fontSize: '0.875rem', fontWeight: '600' }}><CheckCircle size={16} /> En collecte</span>;
      case 'FUNDED': return <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: '600' }}><CheckCircle size={16} /> Financé</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>{dashboardTitle}</h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-primary-800)', marginBottom: '1rem', fontSize: '1.5rem', marginTop: 0 }}>Bonjour, {user.firstName || user.email} 👋</h2>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.1rem' }}>
          Bienvenue sur votre espace personnel Emeraude Africa. 
          Votre profil est actuellement en cours de vérification par nos équipes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* CARTE DYNAMIQUE */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', gridColumn: '1 / -1' }}>
          {isProjectOwner ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Lightbulb size={32} color="var(--color-primary-500)" />
                <h3 style={{ color: 'var(--color-neutral-800)', margin: 0, fontSize: '1.5rem' }}>Mes Projets Soumis</h3>
              </div>
              
              {loading ? <p>Chargement...</p> : projects.length === 0 ? (
                <div>
                  <p style={{ color: 'var(--color-neutral-500)' }}>Vous n'avez pas encore soumis de projet. Déposez votre dossier pour étude.</p>
                  <button onClick={() => navigate('/financer')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Soumettre un projet</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {projects.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{p.title}</h4>
                        <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>Cible : {p.target.toLocaleString()} FCFA</div>
                      </div>
                      <div>{renderStatus(p.status)}</div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/financer')} className="btn btn-outline" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>Soumettre un nouveau projet</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Building2 size={32} color="var(--color-primary-500)" />
                <h3 style={{ color: 'var(--color-neutral-800)', margin: 0, fontSize: '1.5rem' }}>Mes Investissements</h3>
              </div>
              
              {loading ? <p>Chargement...</p> : investments.length === 0 ? (
                <div>
                  <p style={{ color: 'var(--color-neutral-500)' }}>Vous n'avez pas encore d'investissement actif. Explorez nos projets pour commencer.</p>
                  <button onClick={() => navigate('/investir')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Découvrir les projets</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {investments.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{inv.project.title}</h4>
                        <div style={{ color: 'var(--color-neutral-600)', fontWeight: 'bold' }}>{inv.amount.toLocaleString()} FCFA</div>
                        <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Rendement cible : {inv.project.returnRate}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '0.5rem' }}>{renderStatus(inv.status)}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/investir')} className="btn btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>Nouvel investissement</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CARTE DOCUMENTS */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', opacity: 0.7 }}>
          <FileText size={32} color="var(--color-neutral-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-neutral-800)', marginBottom: '0.5rem', marginTop: 0 }}>Mes Documents</h3>
          <p style={{ color: 'var(--color-neutral-500)' }}>
            {isProjectOwner ? 'Vos contrats de financement apparaîtront ici.' : 'Vos contrats et rapports financiers apparaîtront ici.'}
          </p>
          <button className="btn btn-outline" disabled style={{ marginTop: '1.5rem', width: '100%' }}>Bientôt disponible</button>
        </div>

        {/* CARTE PROFIL */}
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
