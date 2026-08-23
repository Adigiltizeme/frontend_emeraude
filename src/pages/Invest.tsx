import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Invest = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/projects')
      .then(res => res.json())
      .then(data => {
        // Ne pas afficher les brouillons sur la page publique
        const publicProjects = data.filter((p: any) => p.status !== 'DRAFT');
        setProjects(publicProjects);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des projets", err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#475569' }}>{t('invest.loading')}</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{t('invest.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', maxWidth: '600px', margin: '1rem auto 0' }}>
          {t('invest.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {projects.map(project => {
          const isClosed = project.status === "FUNDED" || project.status === "COMPLETED";
          return (
            <div key={project.id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative' }} className="project-card">
              <div className="project-card-image" style={{ height: '200px', backgroundImage: `url(${project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease', filter: isClosed ? 'grayscale(100%) opacity(0.8)' : 'none' }}></div>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: project.status === 'COLLECTING' ? 'var(--color-primary-600)' : 'var(--color-neutral-800)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {t(`admin.status.${project.status}`)}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: '600', marginBottom: '0.5rem' }}>{project.location}</div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{project.title}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>{t('invest.labelTarget')}</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(project.target)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>{t('invest.labelReturn')}</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-600)' }}>{project.returnRate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--color-neutral-600)' }}>{t('invest.labelDuration')}</span>
                  <span style={{ fontWeight: '600' }}>{project.duration} {t('invest.months')}</span>
                </div>

                <Link to={`/projet/${project.id}`} className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                  {t('invest.btnDiscover')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Invest;
