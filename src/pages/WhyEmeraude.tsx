import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, Coins, Eye, Globe2, SearchCheck, ShieldCheck, Smartphone } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const REASON_ICONS = [Coins, Smartphone, SearchCheck, Eye, ShieldCheck, Globe2];

interface Item { title: string; desc: string }

/** Page « Pourquoi Emeraude Africa » : arguments, processus de sélection, risques. */
const WhyEmeraude = () => {
  const { t } = useTranslation();
  usePageMeta(t('why.title'), t('why.subtitle'));

  const reasons = t('why.reasons', { returnObjects: true }) as Item[];
  const steps = t('why.steps', { returnObjects: true }) as Item[];

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1100px' }}>
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)' }}>{t('why.title')}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-neutral-600)', maxWidth: '680px', margin: '1rem auto 0' }}>{t('why.subtitle')}</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {Array.isArray(reasons) && reasons.map((reason, i) => {
          const Icon = REASON_ICONS[i % REASON_ICONS.length];
          return (
            <article key={reason.title} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-neutral-100)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={24} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)' }}>{reason.title}</h2>
              <p style={{ color: 'var(--color-neutral-600)', lineHeight: 1.6, margin: 0 }}>{reason.desc}</p>
            </article>
          );
        })}
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--color-primary-800)', marginBottom: '2rem' }}>{t('why.processTitle')}</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
          {Array.isArray(steps) && steps.map((step, i) => (
            <li key={step.title} style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>{i + 1}</div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{step.title}</h3>
              <p style={{ color: 'var(--color-neutral-600)', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ display: 'flex', gap: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '4rem' }}>
        <AlertTriangle size={28} color="#b45309" style={{ flexShrink: 0 }} aria-hidden="true" />
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#92400e', marginBottom: '0.5rem' }}>{t('why.riskTitle')}</h2>
          <p style={{ color: '#78350f', lineHeight: 1.6, marginBottom: '0.5rem' }}>{t('why.riskDesc')}</p>
          <Link to="/cgu-cgv" style={{ color: '#92400e', fontWeight: 600, textDecoration: 'underline' }}>{t('why.riskLink')}</Link>
        </div>
      </section>

      <section style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{t('why.ctaTitle')}</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/investir" className="btn btn-primary" style={{ padding: '0.9rem 1.75rem' }}>{t('why.ctaInvest')}</Link>
          <Link to="/financer" className="btn btn-outline" style={{ padding: '0.9rem 1.75rem' }}>{t('why.ctaFinance')}</Link>
        </div>
      </section>
    </div>
  );
};

export default WhyEmeraude;
