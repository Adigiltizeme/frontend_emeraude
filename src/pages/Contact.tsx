import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { API_URL } from '../config/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { fieldStyle } from '../config/formStyles';

const SUBJECTS = [
  { value: 'INVEST', label: 'contact.optInvest' },
  { value: 'PROJECT', label: 'contact.optProject' },
  { value: 'SUPPORT', label: 'contact.optSupport' },
  { value: 'OTHER', label: 'contact.optOther' },
];

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  usePageMeta(t('contact.title'), t('contact.subtitle'));

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'INVEST', message: '', website: '' });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.message.trim().length < 10) return setError(t('contact.errorMessage'));
    if (!acceptedPrivacy) return setError(t('contact.errorConsent'));
    setState('sending');
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CONTACT',
          ...form,
          phone: form.phone || undefined,
          website: form.website || undefined,
          source: '/contact',
          locale: i18n.language?.startsWith('en') ? 'en' : 'fr',
          acceptedPrivacy: true,
        }),
      });
      if (!res.ok) throw new Error();
      setState('sent');
      setForm({ name: '', email: '', phone: '', subject: 'INVEST', message: '', website: '' });
      setAcceptedPrivacy(false);
    } catch {
      setError(t('contact.error'));
      setState('idle');
    }
  };

  const inputStyle = fieldStyle;
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 500 } as const;

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{t('contact.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem', fontSize: '1.1rem' }}>{t('contact.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '3rem' }}>
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{t('contact.formTitle')}</h2>

          {state === 'sent' ? (
            <div role="status" style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#15803d', marginBottom: '1.5rem' }}>{t('contact.success')}</p>
              <button type="button" className="btn btn-outline" onClick={() => setState('idle')}>{t('contact.sendAnother')}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>
              <div>
                <label htmlFor="contact-name" style={labelStyle}>{t('contact.labelName')}</label>
                <input id="contact-name" name="name" type="text" required maxLength={120} value={form.name} onChange={handleChange} placeholder={t('contact.placeholderName')} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="contact-email" style={labelStyle}>{t('contact.labelEmail')}</label>
                <input id="contact-email" name="email" type="email" required maxLength={254} value={form.email} onChange={handleChange} placeholder={t('contact.placeholderEmail')} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="contact-phone" style={labelStyle}>{t('contact.labelPhone')}</label>
                <input id="contact-phone" name="phone" type="tel" maxLength={30} value={form.phone} onChange={handleChange} placeholder={t('contact.placeholderPhone')} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="contact-subject" style={labelStyle}>{t('contact.labelSubject')}</label>
                <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} style={inputStyle}>
                  {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" style={labelStyle}>{t('contact.labelMessage')}</label>
                <textarea id="contact-message" name="message" rows={5} required maxLength={5000} value={form.message} onChange={handleChange} placeholder={t('contact.placeholderMessage')} style={inputStyle} />
              </div>

              {/* Champ piège invisible pour les robots : ne pas supprimer. */}
              <input type="text" name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-neutral-600)', cursor: 'pointer' }}>
                <input type="checkbox" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} style={{ marginTop: '0.25rem' }} />
                <span><Trans i18nKey="contact.consent" components={{ link: <Link to="/politique-confidentialite" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }} /> }} /></span>
              </label>

              {error && <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={state === 'sending'} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                {state === 'sending' ? t('contact.sending') : t('contact.btnSend')}
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('contact.infoTitle')}</h2>
            <p style={{ color: 'var(--color-neutral-600)', marginBottom: '1rem' }}>{t('contact.infoDesc')}</p>
          </div>
          {[
            { icon: <Mail size={24} />, title: t('contact.labelEmail'), lines: [settings.contactEmail] },
            { icon: <Phone size={24} />, title: t('contact.phoneLabel'), lines: [settings.contactPhone, t('contact.phoneHours')] },
            { icon: <MapPin size={24} />, title: t('contact.officeLabel'), lines: [settings.contactAddress] },
          ].map((item) => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-600)' }}>{item.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                {item.lines.map((line, i) => (
                  <p key={i} style={{ color: 'var(--color-neutral-600)', fontSize: i > 0 ? '0.875rem' : undefined }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
