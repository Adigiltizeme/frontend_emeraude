import { useTranslation } from 'react-i18next';
import { Building2, HandCoins, Users } from 'lucide-react';
import { formatMoney } from '../config/api';
import { useSiteSettings } from '../context/SettingsContext';

/**
 * Chiffres clés réels (calculés par l'API à partir des projets publiés et des investissements validés).
 * Un chiffre nul n'est pas affiché : pas de « 0 investisseur » sur un site qui démarre.
 */
const KeyFigures = () => {
  const { t, i18n } = useTranslation();
  const { stats } = useSiteSettings();
  if (!stats) return null;
  const figures = [
    { key: 'raised', value: stats.totalRaised, text: formatMoney(stats.totalRaised, i18n.language), icon: <HandCoins size={28} /> },
    { key: 'funded', value: stats.fundedProjects, text: stats.fundedProjects.toLocaleString(i18n.language), icon: <Building2 size={28} /> },
    { key: 'investors', value: stats.investors, text: stats.investors.toLocaleString(i18n.language), icon: <Users size={28} /> },
  ].filter((f) => f.value > 0);
  if (!figures.length) return null;

  return (
    <section aria-labelledby="key-figures-title" className="container" style={{ padding: '3rem 1rem 1rem' }}>
      <h2 id="key-figures-title" className="section-title">{t('keyFigures.title')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 220px), 1fr))`, gap: '1.25rem' }}>
        {figures.map((f) => (
          <div key={f.key} style={{ textAlign: 'center', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'white', border: '1px solid var(--color-neutral-200)' }}>
            <div style={{ color: 'var(--color-primary-600)', display: 'flex', justifyContent: 'center' }} aria-hidden="true">{f.icon}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-primary-900)', margin: '0.5rem 0 0.25rem' }}>{f.text}</div>
            <div style={{ color: 'var(--color-neutral-600)' }}>{t(`keyFigures.${f.key}`, { count: f.value })}</div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: '0.75rem' }}>{t('keyFigures.source')}</p>
    </section>
  );
};

export default KeyFigures;
