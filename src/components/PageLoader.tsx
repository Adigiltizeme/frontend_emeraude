import { useTranslation } from 'react-i18next';

/** Affiché pendant le chargement d'une page (découpage du code : chaque page est téléchargée à la première visite). */
const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)' }}>
      <span style={{ width: 28, height: 28, border: '3px solid var(--color-neutral-200)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', marginRight: '0.75rem', animation: 'emeraude-spin 0.8s linear infinite' }} aria-hidden="true" />
      {t('common.loading')}
    </div>
  );
};

export default PageLoader;
