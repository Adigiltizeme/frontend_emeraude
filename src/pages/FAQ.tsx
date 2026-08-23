import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') }
  ];

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{t('faq.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem' }}>
          {t('faq.subtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-primary-600)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--color-primary-900)' }}>{faq.question}</h3>
            <p style={{ color: 'var(--color-neutral-600)', lineHeight: '1.6' }}>{faq.answer}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('faq.notFoundTitle')}</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-neutral-600)' }}>{t('faq.notFoundDesc')}</p>
        <a href="/contact" className="btn btn-outline">{t('faq.btnContact')}</a>
      </div>
    </div>
  );
};

export default FAQ;
