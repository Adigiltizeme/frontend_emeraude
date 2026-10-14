import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { useLocation } from 'react-router-dom';

/** Bandeau d'annonce (paramètre « siteAnnouncement ») : maintenance, nouveauté… */
export const AnnouncementBanner = () => {
  const { settings } = useSiteSettings();
  if (!settings.siteAnnouncement) return null;
  return (
    <div role="status" style={{ backgroundColor: 'var(--color-primary-900)', color: 'white', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
      {settings.siteAnnouncement}
    </div>
  );
};

/** Bouton WhatsApp flottant (paramètre « whatsappNumber ») : support conversationnel (CdC §4.2). */
export const WhatsAppButton = () => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const digits = settings.whatsappNumber.replace(/[^0-9]/g, '');
  // Back-office : pas de bouton (l'équipe n'écrit pas à elle-même).
  if (!digits || pathname.startsWith('/admin')) return null;
  // Message prérempli : sur une fiche projet, le lien du projet aide l'équipe à répondre tout de suite.
  const text = pathname.startsWith('/projet/') ? t('whatsapp.projectMessage', { url: window.location.href }) : t('whatsapp.message');
  return (
    <a
      href={`https://wa.me/${digits}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.label')}
      title={t('whatsapp.label')}
      style={{ position: 'fixed', right: '1rem', bottom: '1rem', zIndex: 9990, width: 56, height: 56, borderRadius: '50%', backgroundColor: '#25d366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }}
    >
      <MessageCircle size={28} aria-hidden="true" />
    </a>
  );
};

/** Liens vers les réseaux sociaux renseignés dans les paramètres. */
export const SocialLinks = () => {
  const { settings } = useSiteSettings();
  const links = [
    { url: settings.socialFacebook, label: 'Facebook', Icon: Facebook },
    { url: settings.socialLinkedin, label: 'LinkedIn', Icon: Linkedin },
    { url: settings.socialInstagram, label: 'Instagram', Icon: Instagram },
  ].filter((l) => l.url);
  if (!links.length) return null;
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
      {links.map(({ url, label, Icon }) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
          <Icon size={22} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
};
