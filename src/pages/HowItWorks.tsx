import { useTranslation } from 'react-i18next';
import { UserPlus, Search, CreditCard, BarChart2 } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <UserPlus size={40} />,
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc')
    },
    {
      icon: <Search size={40} />,
      title: t('howItWorks.step2Title'),
      desc: t('howItWorks.step2Desc')
    },
    {
      icon: <CreditCard size={40} />,
      title: t('howItWorks.step3Title'),
      desc: t('howItWorks.step3Desc')
    },
    {
      icon: <BarChart2 size={40} />,
      title: t('howItWorks.step4Title'),
      desc: t('howItWorks.step4Desc')
    }
  ];

  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{t('howItWorks.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem', fontSize: '1.1rem' }}>
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {steps.map((step, index) => (
          <div key={index} style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', marginBottom: '1.5rem' }}>
              {step.icon}
            </div>
            <h3 style={{ marginBottom: '1rem' }}>{step.title}</h3>
            <p style={{ color: 'var(--color-neutral-600)' }}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <a href="/investir" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>{t('howItWorks.btnStart')}</a>
      </div>
    </div>
  );
};

export default HowItWorks;
