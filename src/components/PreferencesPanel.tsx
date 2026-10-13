import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL, authHeaders } from '../config/api';
import { compactFieldStyle } from '../config/formStyles';

interface Preferences {
  emailSupportReplies: boolean;
  emailNewInvestmentOnMyProject: boolean;
  newsletter: boolean;
  locale: 'fr' | 'en';
}

const TOGGLES: (keyof Omit<Preferences, 'locale'>)[] = ['emailSupportReplies', 'emailNewInvestmentOnMyProject', 'newsletter'];

/** Préférences de communication de l'utilisateur : enregistrées immédiatement à chaque changement. */
const PreferencesPanel = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me/preferences`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setPrefs(data))
      .catch(() => {});
  }, [token]);

  const update = async (patch: Partial<Preferences>) => {
    if (!prefs) return;
    const previous = prefs;
    setPrefs({ ...prefs, ...patch });
    setStatus(null);
    if (patch.locale) i18n.changeLanguage(patch.locale);
    try {
      const res = await fetch(`${API_URL}/auth/me/preferences`, {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setPrefs(await res.json());
      setStatus({ ok: true, text: t('preferences.saved') });
    } catch {
      setPrefs(previous);
      setStatus({ ok: false, text: t('preferences.error') });
    }
  };

  if (!prefs) return null;

  return (
    <section style={{ backgroundColor: 'var(--color-white)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-neutral-200)', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Bell size={22} color="var(--color-primary-600)" />
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-neutral-800)', margin: 0 }}>{t('preferences.title')}</h2>
      </div>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{t('preferences.desc')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {TOGGLES.map((key) => (
          <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs[key]} onChange={(e) => update({ [key]: e.target.checked })} style={{ marginTop: '0.2rem', width: '1.1rem', height: '1.1rem' }} />
            <span>{t(`preferences.${key}`)}</span>
          </label>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>{t('preferences.language')}</span>
          <select value={prefs.locale} onChange={(e) => update({ locale: e.target.value as 'fr' | 'en' })} style={{ ...compactFieldStyle, width: 'auto' }}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      {status && (
        <p role="status" style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.9rem', color: status.ok ? '#166534' : '#b91c1c' }}>{status.text}</p>
      )}
    </section>
  );
};

export default PreferencesPanel;
