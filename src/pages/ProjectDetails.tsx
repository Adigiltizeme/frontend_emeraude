import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, TrendingUp, Clock, AlertTriangle, FileText, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProjectMap from '../components/ProjectMap';


const ProjectDetails = ({ isPreview = false, previewData = null }: any) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(previewData);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [investAmount, setInvestAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [investLoading, setInvestLoading] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(false);
    
  useEffect(() => {
    if (isPreview && previewData) {
      setProject(previewData);
      setLoading(false);
      return;
    }

    if (id) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/projects/${id}`)
        .then(res => res.json())
        .then(data => {
          setProject(data);

          
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur de chargement du projet", err);
          setLoading(false);
        });
    }
  }, [id, isPreview, previewData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#475569' }}>Chargement du projet...</div>;
  }

  if (!project) {
    return <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#991b1b' }}>Projet introuvable</div>;
  }

  // Calcul du pourcentage de levée (simulé pour l'instant si non géré en base)
  const targetNum = project.target || 1;
  const raisedNum = 0; // À remplacer par project.raised si implémenté
  const progressPercent = Math.min(100, Math.round((raisedNum / targetNum) * 100));

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {!isPreview && (
        <Link to="/investir" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-600)', marginBottom: '2rem', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={20} />
          {t('projectDetails.backToProjects')}
        </Link>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        {/* Colonne Principale (Détails) */}
        <div>
          <div className="zoom-wrapper" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <div className="zoom-bg" style={{ backgroundImage: `url(${project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})` }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)', fontWeight: '600', marginBottom: '0.5rem' }}>
            <MapPin size={20} />
            {project.location}
          </div>
          <h1 style={{ marginBottom: '1.5rem' }}>{project.title}</h1>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('projectDetails.descriptionTitle')}</h2>
            <p style={{ color: 'var(--color-neutral-800)', lineHeight: '1.6', marginBottom: '2rem' }}>{project.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', borderTop: '1px solid var(--color-neutral-200)', paddingTop: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-800)', marginBottom: '1rem' }}>{t('projectDetails.financialTitle')}</h3>
                <ul style={{ color: 'var(--color-neutral-800)', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
                  <li><strong>Rentabilité locative :</strong> {project.rentYield ? `~${project.rentYield}% / an` : 'Non applicable'}</li>
                  <li><strong>Plus-value estimée :</strong> {project.capitalGain ? `~${project.capitalGain}% / an` : 'Non applicable'}</li>
                  <li><strong>Garantie :</strong> {project.guarantee || 'Non spécifiée'}</li>
                  <li><strong>Distribution :</strong> {project.distribution || 'Trimestrielle'}</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-800)', marginBottom: '1rem' }}>{t('projectDetails.impactTitle')}</h3>
                <ul style={{ color: 'var(--color-neutral-800)', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
                  <li><strong>Type de bien :</strong> {project.assetType}</li>
                  <li><strong>Impact social / environnemental :</strong> {project.impact || 'Non spécifié'}</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('projectDetails.documentsTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-neutral-300)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileText color="var(--color-primary-600)" />
                  <span style={{ fontWeight: '500' }}>{t('projectDetails.docBrochure')}</span>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-neutral-300)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-white)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileText color="var(--color-primary-600)" />
                  <span style={{ fontWeight: '500' }}>{t('projectDetails.docLegal')}</span>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Localisation du projet</h2>
                <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.875rem' }}>{t('projectDetails.mapDisclaimer')}</p>
              </div>
            <ProjectMap location={project.location} />
          </div>
        </div>

        {/* Colonne Latérale (Investissement) */}
        <div>
          <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-900)' }}>{formatCurrency(0)}</span>
                <span style={{ color: 'var(--color-neutral-600)', fontSize: '0.875rem' }}>{t('projectDetails.raised')} {formatCurrency(project.target)}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--color-neutral-200)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, backgroundColor: 'var(--color-primary-500)', height: '100%' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={16} /> {t('invest.labelReturn')}</span>
                <span style={{ fontWeight: '700', color: 'var(--color-primary-600)' }}>{project.returnRate}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {t('invest.labelDuration')}</span>
                <span style={{ fontWeight: '600' }}>{project.duration} mois</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>{t('projectDetails.minTicket')}</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(project.minTicket)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> {t('projectDetails.riskLevel')}</span>
                <span style={{ fontWeight: '600' }}>{project.riskLevel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>{t('projectDetails.status')}</span>
                <span style={{ fontWeight: '600', color: project.status === 'FUNDED' || project.status === 'COMPLETED' ? 'var(--color-accent-600)' : 'var(--color-primary-600)' }}>{t(`admin.status.${project.status}`)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>{t('projectDetails.assetType')}</span>
                <span style={{ fontWeight: '600' }}>{project.assetType}</span>
              </div>
            </div>

            {!showInvestForm && !investSuccess && (
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setShowInvestForm(true);
                  }
                }} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }} 
                disabled={project.status === 'FUNDED' || project.status === 'COMPLETED' || project.status === 'SUBMITTED' || project.status === 'DRAFT'}
              >
                {project.status === 'FUNDED' || project.status === 'COMPLETED' ? t('projectDetails.statusFunded') : 
                 project.status === 'SUBMITTED' || project.status === 'DRAFT' ? 'Projet non ouvert' : 'Investir maintenant'}
              </button>
            )}

            {showInvestForm && !investSuccess && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary-900)' }}>Finaliser l'investissement</h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Montant (FCFA)</label>
                  <input 
                    type="number" 
                    min={project.minTicket}
                    value={investAmount} 
                    onChange={e => setInvestAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    placeholder={`Min. ${project.minTicket.toLocaleString()} FCFA`}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Moyen de paiement</label>
                  <select 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money (Orange, Wave...)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setShowInvestForm(false)} 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '0.75rem' }}
                    disabled={investLoading}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={async () => {
                      if (!investAmount || investAmount < project.minTicket) {
                        alert(`Le montant minimum est de ${project.minTicket} FCFA`);
                        return;
                      }
                      setInvestLoading(true);
                      try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/investments`, {
                          method: 'POST',
                          headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            projectId: project.id,
                            amount: investAmount,
                            paymentMethod
                          })
                        });
                        if (res.ok) {
                          setInvestSuccess(true);
                        } else {
                          const err = await res.json();
                          alert(err.message || 'Erreur lors de la création');
                        }
                      } catch (error) {
                        alert('Erreur serveur');
                      } finally {
                        setInvestLoading(false);
                      }
                    }} 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.75rem' }}
                    disabled={investLoading}
                  >
                    {investLoading ? 'Validation...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            )}

            {investSuccess && (
              <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#dcfce7', borderRadius: '8px', border: '1px solid #16a34a', textAlign: 'center' }}>
                <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#16a34a' }}>Demande enregistrée !</h4>
                <p style={{ fontSize: '0.9rem', color: '#15803d', marginBottom: '1rem' }}>
                  Notre équipe va vous contacter avec les instructions de paiement.
                </p>
                <button onClick={() => navigate('/mon-compte')} className="btn btn-primary" style={{ width: '100%' }}>
                  Suivre mon investissement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Section Localisation Approximative */}
             </div>
  );
};

export default ProjectDetails;
