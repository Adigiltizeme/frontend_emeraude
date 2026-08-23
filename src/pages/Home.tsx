import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613490908677-22d733575fa6?q=80&w=2070&auto=format&fit=crop'
];

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [topProjects, setTopProjects] = useState<any[]>([]);

  useEffect(() => {
    // Hero slideshow
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch top projects
    const fetchTopProjects = async () => {
      try {
        const res = await fetch('http://localhost:3000/projects');
        if (res.ok) {
          const data = await res.json();
          // Trier par rentabilité locative ou montant cible et prendre les 4 premiers
          const sorted = data.sort((a: any, b: any) => (b.rentYield || 0) - (a.rentYield || 0)).slice(0, 4);

          // Si on a moins de 4 projets, on les duplique pour l'effet visuel du carrousel
          if (sorted.length > 0 && sorted.length < 4) {
            const repeated = [];
            while (repeated.length < 4) {
              repeated.push(...sorted);
            }
            setTopProjects(repeated.slice(0, 4));
          } else {
            setTopProjects(sorted);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des projets', err);
      }
    };
    fetchTopProjects();
  }, []);

  // On répète les projets pour l'effet de défilement infini sans coupure sur les très grands écrans
  const displayProjects = [...topProjects, ...topProjects, ...topProjects, ...topProjects];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '8rem 1rem',
        color: 'var(--color-white)',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Images with Fade transition */}
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        {/* Emerald Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-primary-900)',
          opacity: 0.75, // Adjust opacity to see the image behind
          zIndex: 1
        }} />

        {/* Content */}
        <div className="container" style={{ position: 'relative', zIndex: 2, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: '3rem', textShadow: '0 2px 8px rgba(0,0,0,0.8)', marginBottom: '1rem' }}>{t('home.title')}</h1>
          <p style={{ color: 'white', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{t('home.subtitle')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/investir')} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>{t('home.btnInvest')}</button>
            <button onClick={() => navigate('/financer')} className="btn btn-outline" style={{ color: 'white', borderColor: 'white', padding: '1rem 2rem', fontSize: '1.1rem' }}>{t('home.btnFinance')}</button>
          </div>
        </div>
      </section>

      {/* Top Projects Marquee Section */}
      {topProjects.length > 0 && (
        <section className="marquee-container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-900)' }}>{t('home.topProjects')}</h2>
          <div className="marquee-content">
            {displayProjects.map((project, index) => {
              const isClosed = project.status === "FUNDED" || project.status === "COMPLETED";
              return (
                <div
                  key={index}
                  className="project-card-marquee"
                  onClick={() => navigate(`/projet/${project.id}`)}
                  style={{ position: 'relative' }}
                >
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: project.status === 'COLLECTING' ? 'var(--color-primary-600)' : 'var(--color-neutral-800)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{t(`admin.status.${project.status}`)}</div>
                  <img style={{ filter: isClosed ? 'grayscale(100%) opacity(0.8)' : 'none' }} src={project.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop'} alt={project.title} />
                  <div className="project-card-marquee-info">
                    <h4>{project.title}</h4>
                    <p>{t('home.profitability')} : {project.rentYield || project.returnRate}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>{t('home.featuresTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="feature-card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary-600)' }}>
              <Building2 size={48} />
            </div>
            <h3>{t('home.feature1Title')}</h3>
            <p>{t('home.feature1Desc')}</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary-600)' }}>
              <ShieldCheck size={48} />
            </div>
            <h3>{t('home.feature2Title')}</h3>
            <p>{t('home.feature2Desc')}</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary-600)' }}>
              <TrendingUp size={48} />
            </div>
            <h3>{t('home.feature3Title')}</h3>
            <p>{t('home.feature3Desc')}</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary-600)' }}>
              <Users size={48} />
            </div>
            <h3>{t('home.feature4Title')}</h3>
            <p>{t('home.feature4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" style={{
        position: 'relative',
        padding: '6rem 1rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <div className="contact-section-bg" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />

        {/* Dark Slate Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1e293b',
          opacity: 0.85,
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{t('home.contactTitle')}</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {t('home.contactDesc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+221770000000" className="btn" style={{ backgroundColor: 'white', color: '#1e293b', fontWeight: 'bold', padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📞</span> {t('home.contactCall')}
            </a>
            <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#25D366', color: 'white', fontWeight: 'bold', padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💬</span> {t('home.contactWa')}
            </a>
            <a href="/contact" className="btn btn-outline" style={{ color: 'white', borderColor: 'white', fontWeight: 'bold', padding: '1rem 2rem', fontSize: '1.1rem' }}>
              {t('home.contactMsg')}</a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: 'var(--color-primary-50)', padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h2>{t('home.ctaTitle')}</h2>
          <p style={{ maxWidth: '600px', margin: '1rem auto 2rem', color: 'var(--color-neutral-600)' }}>
            {t('home.ctaDesc')}
          </p>
          <button onClick={() => navigate('/investir')} className="btn btn-primary">{t('home.ctaBtn')}</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
