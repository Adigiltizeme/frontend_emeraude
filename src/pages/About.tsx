import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)' }}>{t('about.title')}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-neutral-600)', marginTop: '1rem' }}>
          {t('about.subtitle')}
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--color-primary-800)', marginBottom: '1rem' }}>{t('about.missionTitle')}</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-neutral-800)', lineHeight: '1.8' }}>
          {t('about.missionDesc')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--color-accent-600)' }}>{t('about.transparencyTitle')}</h3>
          <p>{t('about.transparencyDesc')}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--color-accent-600)' }}>{t('about.securityTitle')}</h3>
          <p>{t('about.securityDesc')}</p>
        </div>
      </div>

      <div>
        <h2 style={{ color: 'var(--color-primary-800)', marginBottom: '1rem' }}>{t('about.teamTitle')}</h2>
        <p style={{ color: 'var(--color-neutral-800)', marginBottom: '2rem' }}>
          {t('about.teamDesc')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'center', backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-neutral-100)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
            <h4>{t('about.roleCeo')}</h4>
            <p style={{ color: 'var(--color-accent-600)', fontWeight: 'bold' }}>Madihawa SAMASSA</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'center', backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-neutral-100)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
            <h4>{t('about.roleCoo')}</h4>
            <p style={{ color: 'var(--color-accent-600)', fontWeight: 'bold' }}>Digiltizème</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
