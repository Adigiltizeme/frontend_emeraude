import { useTranslation } from 'react-i18next';

const Legal = () => {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '3rem' }}>{t('legal.title')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-800)' }}>{t('legal.section1Title')}</h2>
          <p style={{ color: 'var(--color-neutral-800)' }} dangerouslySetInnerHTML={{ __html: t('legal.section1Desc') }}></p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-800)' }}>{t('legal.section2Title')}</h2>
          <p style={{ color: 'var(--color-neutral-800)' }}>{t('legal.section2Desc')}</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-800)' }}>{t('legal.section3Title')}</h2>
          <p style={{ color: 'var(--color-neutral-800)' }}>{t('legal.section3Desc')}</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-800)' }}>{t('legal.section4Title')}</h2>
          <p style={{ color: 'var(--color-neutral-800)' }}>{t('legal.section4Desc')}</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary-800)' }}>{t('legal.section5Title')}</h2>
          <p style={{ color: 'var(--color-neutral-800)' }}>{t('legal.section5Desc')}</p>
        </section>
      </div>
    </div>
  );
};

export default Legal;
