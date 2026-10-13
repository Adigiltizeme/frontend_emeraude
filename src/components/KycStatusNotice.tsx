import { useTranslation } from 'react-i18next';
import { Clock, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

const STYLES: Record<string, { color: string; background: string; border: string; icon: JSX.Element }> = {
  VERIFIED: { color: '#166534', background: '#f0fdf4', border: '#bbf7d0', icon: <ShieldCheck size={20} /> },
  PENDING: { color: '#92400e', background: '#fffbeb', border: '#fde68a', icon: <Clock size={20} /> },
  REJECTED: { color: '#991b1b', background: '#fef2f2', border: '#fecaca', icon: <ShieldAlert size={20} /> },
  UNVERIFIED: { color: '#334155', background: '#f8fafc', border: '#e2e8f0', icon: <ShieldQuestion size={20} /> },
};

/** Statut de la vérification d'identité, expliqué en clair (et motif du refus le cas échéant). */
const KycStatusNotice = ({ status, reason }: { status?: string | null; reason?: string | null }) => {
  const { t } = useTranslation();
  const key = status && STYLES[status] ? status : 'UNVERIFIED';
  const style = STYLES[key];
  return (
    <div role="status" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.9rem 1rem', borderRadius: '8px', backgroundColor: style.background, border: `1px solid ${style.border}`, color: style.color }}>
      <span style={{ flexShrink: 0, marginTop: '0.1rem' }}>{style.icon}</span>
      <div>
        <div style={{ fontWeight: 700 }}>{t(`kyc.status.${key}.label`)}</div>
        <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{t(`kyc.status.${key}.description`)}</div>
        {key === 'REJECTED' && reason && (
          <div style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}><strong>{t('kyc.reason')}</strong> {reason}</div>
        )}
      </div>
    </div>
  );
};

export default KycStatusNotice;
