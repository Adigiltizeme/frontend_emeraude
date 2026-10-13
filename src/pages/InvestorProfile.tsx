import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, ClipboardCheck } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { usePageMeta } from '../hooks/usePageMeta';

/** Questions et réponses possibles (le serveur valide les mêmes valeurs et calcule le résultat). */
const QUESTIONS: { key: string; options: string[] }[] = [
  { key: 'experience', options: ['NONE', 'SOME', 'EXPERIENCED'] },
  { key: 'canLoseCapital', options: ['YES', 'NO', 'UNSURE'] },
  { key: 'canWithdrawAnytime', options: ['YES', 'NO', 'UNSURE'] },
  { key: 'returnGuaranteed', options: ['YES', 'NO', 'UNSURE'] },
  { key: 'diversify', options: ['YES', 'NO', 'UNSURE'] },
  { key: 'savingsShare', options: ['LT10', '10TO25', 'GT25'] },
  { key: 'lossAffectsLiving', options: ['YES', 'NO'] },
];

/**
 * Retour vers une page interne uniquement : chemin simple (lettres, chiffres, « / », « - », « _ »).
 * Refuse « // », « /\ » et tout ce que le navigateur interpréterait comme un autre site.
 */
const safeReturn = (value: string | null) => (value && /^\/(?!\/)[A-Za-z0-9/_-]*$/.test(value) ? value : null);

const InvestorProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const [params] = useSearchParams();
  const back = safeReturn(params.get('retour'));
  const { profile, loading, setProfile } = useInvestorProfile();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  usePageMeta(t('investorProfile.title'), t('investorProfile.intro'));

  useEffect(() => {
    // Profil illisible (réseau, serveur) : le formulaire reste disponible, l'enregistrement fera foi.
    if (!profile) { if (!loading) setEditing(true); return; }
    if (profile.answers) setAnswers(profile.answers);
    setEditing(profile.status !== 'VALID');
  }, [profile, loading]);

  const complete = QUESTIONS.every((q) => answers[q.key]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return setError(t('investorProfile.incomplete'));
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/me/investor-profile`, {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (res.status === 429) {
        setError(t('investorProfile.limit'));
        return;
      }
      if (!res.ok) throw new Error();
      setProfile(await res.json());
      setEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError(t('investorProfile.error'));
    } finally {
      setSaving(false);
    }
  };

  const date = (value: string | null) => (value ? new Date(value).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const result = profile?.result;

  return (
    <div className="dashboard-container" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <ClipboardCheck size={30} color="var(--color-primary-600)" />
        <h1 style={{ margin: 0, color: 'var(--color-primary-900)', fontSize: '1.75rem' }}>{t('investorProfile.title')}</h1>
      </div>
      <p style={{ color: 'var(--color-neutral-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {t('investorProfile.intro')} {t('investorProfile.validity', { count: settings.investorProfileValidityMonths })}
      </p>

      {profile && result && !editing && (
        <section className="card-padding" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', marginBottom: '1.5rem' }}>
          {result.fragile ? (
            <div style={{ display: 'flex', gap: '0.75rem', color: '#92400e' }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('investorProfile.result.fragileTitle')}</h2>
                <p style={{ margin: '0.4rem 0', lineHeight: 1.6 }}>{t('investorProfile.result.fragileIntro')}</p>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                  {result.reasons.map((r) => <li key={r}>{t(`investorProfile.reasons.${r}`)}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', color: '#166534' }}>
              <CheckCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{t('investorProfile.result.okTitle')}</h2>
                <p style={{ margin: '0.4rem 0 0', lineHeight: 1.6 }}>{t('investorProfile.result.okText')}</p>
              </div>
            </div>
          )}
          <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', color: 'var(--color-neutral-600)' }}>
            {t('investorProfile.result.score', { score: result.score, max: result.maxScore })} · {t('investorProfile.result.dates', { completed: date(profile.completedAt), expires: date(profile.expiresAt) })}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            {back ? (
              <Link to={`${back}?investir=1`} className="btn btn-primary">{t('investorProfile.backToProject')}</Link>
            ) : (
              <Link to="/mon-compte" className="btn btn-primary">{t('investorProfile.toDashboard')}</Link>
            )}
            <button type="button" className="btn btn-outline" onClick={() => setEditing(true)}>{t('investorProfile.redo')}</button>
          </div>
        </section>
      )}

      {profile?.status === 'EXPIRED' && editing && (
        <p role="status" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem 1rem', borderRadius: '8px' }}>{t('onboarding.profileExpired')}</p>
      )}

      {editing && (
        <form onSubmit={submit} className="card-padding" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
          {QUESTIONS.map((q, index) => (
            <fieldset key={q.key} style={{ border: 'none', padding: 0, margin: '0 0 1.5rem' }}>
              <legend style={{ fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                {index + 1}. {t(`investorProfile.questions.${q.key}.label`)}
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {q.options.map((option) => (
                  <label key={option} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.55rem 0.75rem', borderRadius: '6px', cursor: 'pointer', border: answers[q.key] === option ? '2px solid var(--color-primary-600)' : '1px solid #cbd5e1', backgroundColor: answers[q.key] === option ? 'var(--color-primary-50)' : 'white' }}>
                    <input type="radio" name={q.key} value={option} checked={answers[q.key] === option} onChange={() => setAnswers((a) => ({ ...a, [q.key]: option }))} />
                    <span>{t(`investorProfile.questions.${q.key}.options.${option}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>{t('investorProfile.privacy')}</p>
          {error && <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving || !complete}>{saving ? t('investorProfile.saving') : t('investorProfile.submit')}</button>
            {profile?.status === 'VALID' && <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>{t('investorProfile.cancel')}</button>}
          </div>
        </form>
      )}
    </div>
  );
};

export default InvestorProfilePage;
