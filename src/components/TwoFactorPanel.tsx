import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { fieldStyle, labelStyle } from '../config/formStyles';

/**
 * Double authentification (codes à 6 chiffres d'une application : Google Authenticator, Microsoft Authenticator…).
 * Activation : clé à saisir dans l'application (ou lien sur mobile), puis code de confirmation ; codes de secours affichés une fois.
 */
const TwoFactorPanel = ({ onChange }: { onChange?: (enabled: boolean) => void }) => {
  const { t } = useTranslation();
  const { token, user, login } = useAuth();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [recovery, setRecovery] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => me && setEnabled(!!me.twoFactorEnabled))
      .catch(() => {});
  }, [token]);

  const post = async (path: string, body?: unknown) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/${path}`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(res.status === 429 ? t('twoFactor.tooMany') : Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('twoFactor.error'));
      return data;
    } catch (e: any) {
      setMessage({ ok: false, text: e.message });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const updated = (value: boolean) => {
    setEnabled(value);
    if (user && token) login({ ...user, twoFactorEnabled: value }, token);
    onChange?.(value);
  };

  const [asking, setAsking] = useState(false);
  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post('setup', { password });
    if (data) { setSetup(data); setCode(''); setPassword(''); setAsking(false); }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post('enable', { code });
    if (data) {
      setRecovery(data.recoveryCodes);
      setSetup(null);
      setCode('');
      updated(true);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await post('disable', { password, code });
    if (data) {
      setPassword('');
      setCode('');
      setMessage({ ok: true, text: t('twoFactor.disabled') });
      updated(false);
    }
  };

  if (enabled === null) return null;

  return (
    <section style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--color-neutral-800)', margin: '0 0 0.5rem' }}>
        <KeyRound size={22} color="var(--color-primary-600)" /> {t('twoFactor.title')}
      </h2>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1rem', fontSize: '0.95rem' }}>{t('twoFactor.intro')}</p>

      {recovery && (
        <div role="status" style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', marginBottom: '1rem' }}>
          <strong>{t('twoFactor.recoveryTitle')}</strong>
          <p style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.9rem' }}>{t('twoFactor.recoveryHelp')}</p>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.4rem', listStyle: 'none', padding: 0, margin: 0, fontFamily: 'monospace', fontSize: '1rem' }}>
            {recovery.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <button type="button" className="btn btn-outline" style={{ marginTop: '0.75rem' }} onClick={() => setRecovery(null)}>{t('twoFactor.recoverySaved')}</button>
        </div>
      )}

      {enabled ? (
        <>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 600, margin: '0 0 1rem' }}><ShieldCheck size={18} /> {t('twoFactor.active')}</p>
          <form onSubmit={disable} style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
            <div>
              <label htmlFor="tf-disable-password" style={labelStyle}>{t('twoFactor.password')}</label>
              <input id="tf-disable-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={fieldStyle} />
            </div>
            <div>
              <label htmlFor="tf-disable-code" style={labelStyle}>{t('twoFactor.codeOrRecovery')}</label>
              <input id="tf-disable-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" required maxLength={20} style={fieldStyle} />
            </div>
            <button type="submit" className="btn btn-outline" disabled={busy || !password || !code} style={{ color: '#b91c1c', justifySelf: 'start' }}>{t('twoFactor.disable')}</button>
          </form>
        </>
      ) : setup ? (
        <form onSubmit={confirm} style={{ display: 'grid', gap: '0.75rem', maxWidth: 480 }}>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
            <li>{t('twoFactor.step1')}</li>
            <li>
              {t('twoFactor.step2')}
              <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.08em', padding: '0.5rem 0.75rem', margin: '0.4rem 0', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', overflowWrap: 'anywhere' }}>{setup.secret.replace(/(.{4})/g, '$1 ').trim()}</div>
              <a href={setup.otpauthUrl} style={{ color: 'var(--color-primary-600)', fontSize: '0.9rem' }}>{t('twoFactor.openApp')}</a>
            </li>
            <li>{t('twoFactor.step3')}</li>
          </ol>
          <div>
            <label htmlFor="tf-enable-code" style={labelStyle}>{t('twoFactor.code')}</label>
            <input id="tf-enable-code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" inputMode="numeric" required maxLength={6} style={{ ...fieldStyle, letterSpacing: '0.2em', maxWidth: 200 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={busy || code.length !== 6}>{t('twoFactor.confirm')}</button>
            <button type="button" className="btn btn-outline" onClick={() => setSetup(null)}>{t('twoFactor.cancel')}</button>
          </div>
        </form>
      ) : asking ? (
        <form onSubmit={start} style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
          <div>
            <label htmlFor="tf-setup-password" style={labelStyle}>{t('twoFactor.password')}</label>
            <input id="tf-setup-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={fieldStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={busy || !password}>{t('twoFactor.continue')}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setAsking(false); setPassword(''); }}>{t('twoFactor.cancel')}</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => setAsking(true)}>{t('twoFactor.enable')}</button>
      )}
      {message && <p role={message.ok ? 'status' : 'alert'} style={{ margin: '0.75rem 0 0', color: message.ok ? '#166534' : '#b91c1c' }}>{message.text}</p>}
    </section>
  );
};

export default TwoFactorPanel;
