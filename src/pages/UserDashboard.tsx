import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, Settings, Lightbulb, Clock, CheckCircle, XCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [investments, setInvestments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // L'utilisateur démarre sur l'onglet correspondant à son intention initiale, mais peut basculer
  const [activeTab, setActiveTab] = useState<'investments' | 'projects'>(
    user?.intention === 'Porteur de projet' ? 'projects' : 'investments'
  );

  useEffect(() => {
    if (token) {
      // Fetch Investments
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/investments/my-investments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { setInvestments(data); setLoadingInvestments(false); })
      .catch(err => { console.error(err); setLoadingInvestments(false); });

      // Fetch Projects
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/my-projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { setProjects(data); setLoadingProjects(false); })
      .catch(err => { console.error(err); setLoadingProjects(false); });
    }
  }, [token]);

  if (!user) return null;

    const renderTimeline = (type: 'project' | 'investment', item: any) => {
    let steps: any[] = [];
    let currentStepIndex = 0;
    
    if (type === 'project') {
      if (item.status === 'REJECTED') {
        return (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontWeight: 'bold' }}>
            Projet refusé. Veuillez contacter le support pour plus d'informations.
          </div>
        );
      }
      
      steps = [
        { label: 'Soumission', key: 'SUBMITTED' },
        { label: 'Analyse', key: 'DRAFT' },
        { label: 'En collecte', key: 'COLLECTING' },
        { label: 'Financé', key: 'FUNDED' },
        { label: 'Terminé', key: 'COMPLETED' },
      ];
      
      const statusOrder = ['SUBMITTED', 'DRAFT', 'COLLECTING', 'FUNDED', 'COMPLETED'];
      currentStepIndex = statusOrder.indexOf(item.status);
      if (currentStepIndex === -1) currentStepIndex = 0;
      
    } else {
      if (item.status === 'REJECTED') {
        return (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontWeight: 'bold' }}>
            Investissement annulé ou refusé.
          </div>
        );
      }

      steps = [
        { label: 'Promesse', completed: true },
        { label: 'Fonds reçus', completed: item.status === 'VALIDATED' },
        { label: 'En collecte', completed: item.project.status === 'FUNDED' || item.project.status === 'COMPLETED' },
        { label: 'Projet financé', completed: item.project.status === 'FUNDED' || item.project.status === 'COMPLETED' },
        { label: 'Rendement', completed: item.project.status === 'COMPLETED' },
      ];
      
      // Determine current step based on logic
      if (item.status === 'PENDING') {
        currentStepIndex = 1; // Waiting for funds
      } else if (item.status === 'VALIDATED') {
        if (item.project.status === 'COLLECTING' || item.project.status === 'DRAFT' || item.project.status === 'SUBMITTED') {
          currentStepIndex = 2; // Funds received, waiting for project to finish collecting
        } else if (item.project.status === 'FUNDED') {
          currentStepIndex = 3;
        } else if (item.project.status === 'COMPLETED') {
          currentStepIndex = 4;
        }
      }
    }

    return (
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h5 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-neutral-700)', fontSize: '0.95rem' }}>Suivi d'avancement</h5>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Ligne de fond */}
          <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '4px', backgroundColor: '#e2e8f0', zIndex: 1, borderRadius: '2px' }}></div>
          
          {/* Ligne de progression */}
          <div style={{ position: 'absolute', top: '12px', left: '10%', right: `calc(100% - 10% - (80% / ${steps.length - 1} * ${currentStepIndex}))`, height: '4px', backgroundColor: 'var(--color-primary-500)', zIndex: 2, borderRadius: '2px', transition: 'right 0.5s ease' }}></div>

          {steps.map((step, index) => {
            let isCompleted = false;
            let isActive = false;
            
            if (type === 'project') {
              isCompleted = index < currentStepIndex || (index === currentStepIndex && currentStepIndex === steps.length - 1);
              isActive = index === currentStepIndex && currentStepIndex !== steps.length - 1;
            } else {
              isCompleted = step.completed || index < currentStepIndex;
              isActive = index === currentStepIndex && !step.completed;
              if (index === steps.length - 1 && step.completed) { isCompleted = true; isActive = false; }
            }

            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '20%' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: isCompleted ? 'var(--color-primary-500)' : isActive ? 'white' : 'white',
                  border: isCompleted ? '2px solid var(--color-primary-500)' : isActive ? '2px solid var(--color-primary-500)' : '2px solid #cbd5e1',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: isActive ? '0 0 0 4px rgba(22, 163, 74, 0.1)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? <CheckCircle size={16} color="white" /> : isActive ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary-500)' }} /> : null}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: isCompleted || isActive ? 'bold' : 'normal',
                  color: isCompleted || isActive ? 'var(--color-neutral-800)' : 'var(--color-neutral-400)',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

  const hasInvestments = investments.length > 0;
  const hasProjects = projects.length > 0;

  // Afficher les deux onglets UNIQUEMENT si l'utilisateur a de l'activité dans les deux, 
  // OU s'il a une intention X mais a commencé l'activité Y.
  // Par défaut, s'il n'a rien fait, on ne lui montre que l'onglet de son intention initiale.
  const showInvestorTab = user?.intention === 'Investissement' || hasInvestments || (!hasProjects && user?.intention === 'Demande de renseignements');
  const showProjectTab = user?.intention === 'Porteur de projet' || hasProjects;
  const showTabsHeader = showInvestorTab && showProjectTab;

  const dashboardTitle = activeTab === 'projects' ? 'Mon Espace Porteur de Projet' : 'Mon Espace Investisseur';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)', margin: 0 }}>{dashboardTitle}</h1>
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--color-primary-800)', marginBottom: '0.5rem', fontSize: '1.5rem', marginTop: 0 }}>Bonjour, {user.firstName || user.email} 👋</h2>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.1rem', margin: 0 }}>
          Bienvenue sur votre espace personnel Emeraude Africa.
        </p>
      </div>

      {/* TABS CONTROLLER (Uniquement si les deux sont pertinents) */}
      {showTabsHeader && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-neutral-200)' }}>
          <button 
            onClick={() => setActiveTab('investments')}
            style={{ 
              padding: '1rem 2rem', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'investments' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
              color: activeTab === 'investments' ? 'var(--color-primary-800)' : 'var(--color-neutral-500)',
              fontWeight: activeTab === 'investments' ? 'bold' : 'normal',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-2px'
            }}>
            <Building2 size={20} /> Vue Investisseur
          </button>

          <button 
            onClick={() => setActiveTab('projects')}
            style={{ 
              padding: '1rem 2rem', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'projects' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
              color: activeTab === 'projects' ? 'var(--color-primary-800)' : 'var(--color-neutral-500)',
              fontWeight: activeTab === 'projects' ? 'bold' : 'normal',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-2px'
            }}>
            <Lightbulb size={20} /> Vue Porteur de Projet
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* CARTE DYNAMIQUE (INVESTISSEMENTS OU PROJETS) */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', gridColumn: '1 / -1' }}>
          
          {activeTab === 'projects' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Lightbulb size={32} color="var(--color-primary-500)" />
                <h3 style={{ color: 'var(--color-neutral-800)', margin: 0, fontSize: '1.5rem' }}>Mes Projets Soumis</h3>
              </div>
              
              {loadingProjects ? <p>Chargement...</p> : !hasProjects ? (
                <div>
                  <p style={{ color: 'var(--color-neutral-500)' }}>Vous n'avez pas encore soumis de projet. Déposez votre dossier pour étude.</p>
                  <button onClick={() => navigate('/financer')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Soumettre un projet</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {projects.map(p => (
                    <div key={p.id} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-primary-900)' }}>{p.title}</h4>
                          <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.95rem' }}>Montant cible : <strong>{p.target.toLocaleString('fr-FR')} FCFA</strong></div>
                          {p.status === 'COLLECTING' && <div style={{ color: 'var(--color-primary-700)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 'bold' }}>Fonds levés : {(p.raised || 0).toLocaleString('fr-FR')} FCFA</div>}
                        </div>
                        <div>{renderStatus(p.status)}</div>
                      </div>
                      {renderTimeline('project', p)}
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
              
              {loadingInvestments ? <p>Chargement...</p> : !hasInvestments ? (
                <div>
                  <p style={{ color: 'var(--color-neutral-500)' }}>Vous n'avez pas encore d'investissement actif. Explorez nos projets pour commencer.</p>
                  <button onClick={() => navigate('/investir')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Découvrir les projets</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {investments.map(inv => (
                    <div key={inv.id} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-primary-900)' }}>{inv.project.title}</h4>
                          <div style={{ color: 'var(--color-neutral-600)', fontSize: '1.1rem' }}>Investissement : <strong style={{color: 'var(--color-primary-700)'}}>{inv.amount.toLocaleString('fr-FR')} FCFA</strong></div>
                          <div style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Rendement cible : {inv.project.returnRate}%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '0.5rem' }}>{renderStatus(inv.status)}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      {renderTimeline('investment', inv)}
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
            Vos contrats de financement apparaîtront ici.
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
