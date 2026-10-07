import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

/** Capture de prospects : inscription à la lettre d'information (consentement explicite). */
const NewsletterSignup = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!consent) return setError(t('newsletter.errorConsent'));
    setState('sending');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEWSLETTER',
          email,
          website: website || undefined,
          source: location.pathname.slice(0, 200),
          locale: i18n.language?.startsWith('en') ? 'en' : 'fr',
          acceptedPrivacy: true,
        }),
      });
      if (!res.ok) throw new Error();
      setState('done');
    } catch {
      setError(t('newsletter.error'));
      setState('idle');
    }
  };

  return (
    <section aria-labelledby="newsletter-title" style={{ width: '100%', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
      <h2 id="newsletter-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('newsletter.title')}</h2>
      <p style={{ fontSize: '0.875rem', opacity: 0.85, marginBottom: '0.75rem' }}>{t('newsletter.desc')}</p>
      {state === 'done' ? (
        <p role="status" style={{ fontWeight: 600 }}>{t('newsletter.success')}</p>
      ) : (
        <form onSubmit={submit} noValidate>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label htmlFor="newsletter-email" style={{ position: 'absolute', left: '-10000px' }}>{t('newsletter.placeholder')}</label>
            <input
              id="newsletter-email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              style={{ flex: '1 1 220px', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-neutral-300)', color: 'var(--color-neutral-800)' }}
            />
            <button type="submit" className="btn btn-primary" disabled={state === 'sending'} style={{ padding: '0.6rem 1.25rem' }}>
              {t('newsletter.button')}
            </button>
          </div>
          {/* Champ piège invisible pour les robots. */}
          <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', justifyContent: 'center', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left', cursor: 'pointer' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: '0.15rem' }} />
            <span>{t('newsletter.consent')}</span>
          </label>
          {error && <p role="alert" style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.5rem' }}>{error}</p>}
        </form>
      )}
    </section>
  );
};

export default NewsletterSignup;
