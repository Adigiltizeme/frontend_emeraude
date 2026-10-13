import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle } from 'lucide-react';
import { API_URL, authHeaders } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSiteSettings } from '../context/SettingsContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import KycStatusNotice from './KycStatusNotice';

interface Me {
  emailVerifiedAt: string | null;
  kycStatus: string;
  kycRejectionReason: string | null;
}

interface Step {
  key: string;
  done: boolean;
  detail?: JSX.Element;
  action?: JSX.Element;
}

/**
 * Liste de progression de l'investisseur : e-mail confirmé, identité vérifiée, profil investisseur, premier investissement.
 * Les étapes dépendent des réglages de la plateforme ; la liste disparaît une fois tout terminé.
 */
const OnboardingChecklist = ({ hasInvestment }: { hasInvestment: boolean }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const { settings } = useSiteSettings();
  const { profile, refresh: refreshProfile } = useInvestorProfile();
  const [me, setMe] = useState<Me | null>(null);
  const [resent, setResent] = useState<'idle' | 'sent' | 'error'>('idle');

  const loadMe = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setMe(data))
      .catch(() => {});
  }, [token]);

  const refresh = useCallback(() => { loadMe(); refreshProfile(); }, [loadMe, refreshProfile]);
  useEffect(() => { loadMe(); }, [loadMe]);
  useLiveRefresh(refresh);
  // Validation ou refus du KYC par l'équipe : notification reçue → étapes mises à jour.
  useEffect(() => {
    if (!socket) return;
    socket.on('notification.new', refresh);
    return () => { socket.off('notification.new', refresh); };
  }, [socket, refresh]);

  if (!me || !profile) return null;

  const resend = async () => {
    const res = await fetch(`${API_URL}/auth/resend-verification`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
    setResent(res?.ok ? 'sent' : 'error');
  };

  const steps: Step[] = [];
  if (settings.requireEmailVerification) {
    steps.push({
      key: 'email',
      done: !!me.emailVerifiedAt,
      action: resent === 'idle'
        ? <button type="button" onClick={resend} className="btn btn-outline" style={{ padding: '0.4rem 0.9rem' }}>{t('emailVerification.resend')}</button>
        : <span style={{ fontSize: '0.85rem' }}>{t(resent === 'sent' ? 'emailVerification.resent' : 'emailVerification.resendError')}</span>,
    });
  }
  if (settings.investmentRequiresKyc) {
    steps.push({
      key: 'identity',
      done: me.kycStatus === 'VERIFIED',
      detail: <KycStatusNotice status={me.kycStatus} reason={me.kycRejectionReason} />,
      action: ['UNVERIFIED', 'REJECTED'].includes(me.kycStatus)
        ? <Link to="/mon-profil#kyc" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>{t('onboarding.actions.identity')}</Link>
        : undefined,
    });
  }
  if (settings.investorProfileRequired) {
    steps.push({
      key: 'profile',
      done: profile.status === 'VALID',
      detail: profile.status === 'EXPIRED' ? <span style={{ fontSize: '0.9rem', color: '#92400e' }}>{t('onboarding.profileExpired')}</span> : undefined,
      action: <Link to="/profil-investisseur" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>{t(profile.status === 'EXPIRED' ? 'onboarding.actions.profileRenew' : 'onboarding.actions.profile')}</Link>,
    });
  }
  steps.push({
    key: 'invest',
    done: hasInvestment,
    action: <Link to="/investir" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>{t('onboarding.actions.invest')}</Link>,
  });

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;
  // Une seule étape active à la fois (la première non terminée) : l'utilisateur sait quoi faire ensuite.
  const current = steps.find((s) => !s.done)?.key;

  return (
    <section aria-labelledby="onboarding-title" className="card-padding" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary-200, #a7f3d0)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 id="onboarding-title" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-900)' }}>{t('onboarding.title')}</h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-neutral-600)' }}>{t('onboarding.progress', { done: doneCount, total: steps.length })}</span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount} style={{ height: 8, backgroundColor: 'var(--color-neutral-100, #f1f5f9)', borderRadius: 4, margin: '0.75rem 0 1.25rem', overflow: 'hidden' }}>
        <div style={{ width: `${(doneCount / steps.length) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary-500)', transition: 'width 0.4s ease' }} />
      </div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step) => (
          <li key={step.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', opacity: step.done || step.key === current ? 1 : 0.65 }}>
            <span style={{ color: step.done ? 'var(--color-primary-600)' : 'var(--color-neutral-400)', flexShrink: 0, marginTop: '0.1rem' }}>
              {step.done ? <CheckCircle size={22} aria-label={t('onboarding.done')} /> : <Circle size={22} aria-hidden="true" />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--color-neutral-800)', textDecoration: step.done ? 'line-through' : 'none' }}>{t(`onboarding.steps.${step.key}.title`)}</div>
              {!step.done && <div style={{ fontSize: '0.9rem', color: 'var(--color-neutral-600)', marginTop: '0.2rem' }}>{t(`onboarding.steps.${step.key}.description`)}</div>}
              {!step.done && step.detail && <div style={{ marginTop: '0.6rem' }}>{step.detail}</div>}
              {!step.done && step.key === current && step.action && <div style={{ marginTop: '0.6rem' }}>{step.action}</div>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default OnboardingChecklist;
