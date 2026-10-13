import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { LEGAL_REVISION } from '../config/legal';
import { useSiteSettings } from '../context/SettingsContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatMoney } from '../config/api';

interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
  after?: string[];
}

/** Page légale traduite : contenu dans `legalPages.<page>` des fichiers de langue. */
const LegalPage = ({ page }: { page: 'notice' | 'terms' | 'privacy' }) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  usePageMeta(t(`legalPages.${page}.title`), t(`legalPages.${page}.subtitle`));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Informations légales, frais et délais : paramètres du back-office (aucune donnée écrite en dur).
  const pending = t('legalPages.pending');
  const values = {
    email: settings.contactEmail,
    companyName: settings.legalCompanyName,
    legalForm: settings.legalForm,
    capital: settings.legalCapital,
    registration: settings.legalRegistration || pending,
    address: settings.legalAddress,
    director: settings.legalDirector,
    regulator: settings.legalRegulator || pending,
    license: settings.legalLicense || pending,
    privacyEmail: settings.privacyEmail,
    expiryHours: settings.paymentExpiryHours,
    investorFee: settings.investorFeePercent,
    commission: settings.projectCommissionPercent,
    submissionFee: formatMoney(settings.projectSubmissionFee, i18n.language),
    threshold: settings.successThresholdPercent,
    investorProfileValidityMonths: settings.investorProfileValidityMonths,
  };
  const sections = t(`legalPages.${page}.sections`, { returnObjects: true, ...values }) as LegalSection[];
  const revision = new Date(`${LEGAL_REVISION}T00:00:00`).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <ShieldCheck size={48} color="var(--color-primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--color-primary-900)' }}>{t(`legalPages.${page}.title`)}</h1>
        <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>{t(`legalPages.${page}.subtitle`)}</p>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('legalPages.updated', { date: revision })}</p>
      </div>

      {page === 'notice' && settings.legalIsDemo && (
        <p role="note" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {t('legalPages.demoNotice')}
        </p>
      )}

      <section style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: 'var(--color-neutral-700)', lineHeight: 1.8 }}>
        {Array.isArray(sections) && sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs?.map((p, i) => <p key={`p${i}`}>{p}</p>)}
            {section.items && <ul>{section.items.map((item, i) => <li key={`i${i}`}>{item}</li>)}</ul>}
            {section.after?.map((p, i) => <p key={`a${i}`}>{p}</p>)}
          </div>
        ))}
      </section>
    </div>
  );
};

export default LegalPage;
