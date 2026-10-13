import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MailWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { API_URL, authHeaders } from '../config/api';

/** Événement émis par la page de confirmation : le bandeau disparaît sans recharger. */
export const EMAIL_VERIFIED_EVENT = 'emeraude:email-verified';
/** Événement émis après un changement d'adresse : le bandeau se recharge sans attendre une reconnexion. */
export const EMAIL_CHANGED_EVENT = 'emeraude:email-changed';

/**
 * Rappel de confirmation de l'adresse e-mail (exigée pour investir et déposer un projet,
 * paramètre « requireEmailVerification »), avec renvoi du lien.
 */
const EmailVerificationBanner = () => {
  const { t } = useTranslation();
  const { token, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const reload = () => { setStatus('idle'); setReloadKey((k) => k + 1); };
    window.addEventListener(EMAIL_CHANGED_EVENT, reload);
    return () => window.removeEventListener(EMAIL_CHANGED_EVENT, reload);
  }, []);

  useEffect(() => {
    setEmail(null);
    if (!token || isAdmin || !settings.requireEmailVerification) return;
    fetch(`${API_URL}/auth/me`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => { if (me && !me.emailVerifiedAt) setEmail(me.email); })
      .catch(() => {});
  }, [token, isAdmin, settings.requireEmailVerification, reloadKey]);

  useEffect(() => {
    const hide = () => setEmail(null);
    window.addEventListener(EMAIL_VERIFIED_EVENT, hide);
    return () => window.removeEventListener(EMAIL_VERIFIED_EVENT, hide);
  }, []);

  if (!email) return null;

  const resend = async () => {
    setStatus('sending');
    const res = await fetch(`${API_URL}/auth/resend-verification`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
    setStatus(res?.ok ? 'sent' : 'error');
  };

  return (
    <div role="status" style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', color: '#92400e', padding: '0.6rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
      <MailWarning size={18} aria-hidden="true" />
      <span>
        {status === 'sent' ? t('emailVerification.resent') : status === 'error' ? t('emailVerification.resendError') : t('emailVerification.banner', { email })}
      </span>
      {status !== 'sent' && (
        <button type="button" onClick={resend} disabled={status === 'sending'} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
          {t('emailVerification.resend')}
        </button>
      )}
    </div>
  );
};

export default EmailVerificationBanner;
