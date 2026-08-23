import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1>{t('contact.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem', fontSize: '1.1rem' }}>
          {t('contact.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        {/* Contact Form */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{t('contact.formTitle')}</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('contact.labelName')}</label>
              <input type="text" placeholder={t('contact.placeholderName')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('contact.labelEmail')}</label>
              <input type="email" placeholder={t('contact.placeholderEmail')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('contact.labelSubject')}</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }}>
                <option>{t('contact.optInvest')}</option>
                <option>{t('contact.optProject')}</option>
                <option>{t('contact.optSupport')}</option>
                <option>{t('contact.optOther')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('contact.labelMessage')}</label>
              <textarea rows={5} placeholder={t('contact.placeholderMessage')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }}></textarea>
            </div>
            <button type="button" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>{t('contact.btnSend')}</button>
          </form>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t('contact.infoTitle')}</h2>
            <p style={{ color: 'var(--color-neutral-600)', marginBottom: '2rem' }}>
              {t('contact.infoDesc')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-600)' }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Email</h3>
              <p style={{ color: 'var(--color-neutral-600)' }}>contact@emeraude-africa.com</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-600)' }}>
              <Phone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('contact.phoneLabel')}</h3>
              <p style={{ color: 'var(--color-neutral-600)' }}>+221 77 000 00 00</p>
              <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('contact.phoneHours')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-600)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('contact.officeLabel')}</h3>
              <p style={{ color: 'var(--color-neutral-600)' }} dangerouslySetInnerHTML={{ __html: t('contact.officeAddress') }}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
