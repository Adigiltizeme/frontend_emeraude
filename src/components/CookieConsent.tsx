import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const STORAGE_KEY = 'emeraude_cookie_consent';
const CONSENT_MAX_AGE_MS = 182 * 24 * 3_600_000; // 6 mois (politique de confidentialité)
const GA_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID;

type Choice = 'granted' | 'denied';

function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { choice, at } = JSON.parse(raw);
    if (Date.now() - at > CONSENT_MAX_AGE_MS) return null;
    return choice === 'granted' || choice === 'denied' ? choice : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée) : le bandeau réapparaîtra.
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Charge Google Analytics 4, uniquement après consentement. */
function loadAnalytics() {
  if (!GA_ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

/** Événement « ouvrir le bandeau » déclenché par le lien « Gérer les cookies » du pied de page. */
export const openCookieSettings = () => window.dispatchEvent(new Event('emeraude:cookies'));

/**
 * Bandeau de consentement aux cookies de mesure d'audience.
 * Sans identifiant VITE_GA_MEASUREMENT_ID, aucun traceur n'existe : le bandeau ne s'affiche pas.
 */
const CookieConsent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [choice, setChoice] = useState<Choice | null>(() => readChoice());
  const [open, setOpen] = useState(() => !!GA_ID && readChoice() === null);

  useEffect(() => {
    if (choice === 'granted') loadAnalytics();
  }, [choice]);

  // Page vue à chaque changement de route (application monopage).
  useEffect(() => {
    if (choice === 'granted' && window.gtag && GA_ID) {
      window.gtag('event', 'page_view', { page_path: location.pathname, page_location: window.location.href });
    }
  }, [location.pathname, choice]);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener('emeraude:cookies', reopen);
    return () => window.removeEventListener('emeraude:cookies', reopen);
  }, []);

  const decide = (value: Choice) => {
    saveChoice(value);
    setChoice(value);
    setOpen(false);
    if (value === 'denied' && choice === 'granted') {
      // Retrait du consentement : rechargement pour décharger le traceur.
      window.location.reload();
    }
  };

  if (!GA_ID || !open) return null;

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookies" style={{ position: 'fixed', left: '1rem', right: '1rem', bottom: '1rem', zIndex: 9998, maxWidth: '720px', margin: '0 auto', backgroundColor: 'white', color: 'var(--color-neutral-800)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <p style={{ flex: '1 1 320px', margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
        {t('cookies.text')} <Link to="/politique-confidentialite" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>{t('cookies.more')}</Link>
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Refuser aussi visible qu'accepter. */}
        <button onClick={() => decide('denied')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>{t('cookies.refuse')}</button>
        <button onClick={() => decide('granted')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>{t('cookies.accept')}</button>
      </div>
    </div>
  );
};

export default CookieConsent;
