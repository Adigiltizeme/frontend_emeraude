import { useTranslation } from 'react-i18next';

const Finance = () => {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>{t('finance.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem' }}>
          {t('finance.subtitle')}
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelName')}</label>
              <input type="text" placeholder={t('finance.placeholderName')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelCompany')}</label>
              <input type="text" placeholder={t('finance.placeholderCompany')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelEmail')}</label>
              <input type="email" placeholder={t('finance.placeholderEmail')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelPhone')}</label>
              <input type="tel" placeholder="+221 ..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelCountry')}</label>
            <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }}>
              <option>{t('finance.countrySenegal')}</option>
              <option>{t('finance.countryCI')}</option>
              <option>{t('finance.countryOther')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelTarget')}</label>
            <input type="text" placeholder={t('finance.placeholderTarget')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('finance.labelDesc')}</label>
            <textarea rows={5} placeholder={t('finance.placeholderDesc')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)' }}></textarea>
          </div>

          <button type="button" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>{t('finance.btnSubmit')}</button>
        </form>
      </div>
    </div>
  );
};

export default Finance;
