import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, Copy, Gift, Share2 } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';

interface ReferralData {
  enabled: boolean;
  code: string | null;
  conditions: { referrerReward: number; refereeReward: number; feeDiscountPercent: number; minInvestment: number };
  feeDiscountPercent: number;
  referredBy: string | null;
  referees: { name: string; joinedAt: string; invested: boolean }[];
  rewards: { id: string; role: 'REFERRER' | 'REFEREE'; amount: number; status: 'PENDING' | 'PAID' | 'CANCELLED'; createdAt: string; paidAt: string | null; eligibleAt: string | null; referee: string }[];
  totals: { pending: number; paid: number };
}

/** Parrainage de l'utilisateur : code et lien à partager, conditions, filleuls et primes. */
const ReferralPanel = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/referrals/me`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => null);
  }, [token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);
  // Prime créée ou versée : notification reçue en temps réel.
  useEffect(() => {
    if (!socket) return;
    socket.on('notification.new', load);
    return () => { socket.off('notification.new', load); };
  }, [socket, load]);

  if (!data) return <p role="status">{t('common.loading')}</p>;
  if (!data.enabled || !data.code) return <p style={{ color: 'var(--color-neutral-600)' }}>{t('referral.disabled')}</p>;

  const money = (v: number) => formatMoney(v, i18n.language);
  const link = `${window.location.origin}/inscription?parrain=${data.code}`;
  const c = data.conditions;
  const offers = [
    c.referrerReward > 0 && t('referral.offers.referrer', { amount: money(c.referrerReward) }),
    c.refereeReward > 0 && t('referral.offers.referee', { amount: money(c.refereeReward) }),
    c.feeDiscountPercent > 0 && t('referral.offers.discount', { percent: c.feeDiscountPercent }),
  ].filter(Boolean) as string[];
  const shareText = t('referral.shareText', { link });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('referral.copyManually'), link);
    }
  };
  const share = () => {
    if (navigator.share) navigator.share({ title: t('referral.shareTitle'), text: shareText, url: link }).catch(() => null);
    else window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  };

  const stat = (label: string, value: string) => (
    <div style={{ padding: '1rem', borderRadius: 10, backgroundColor: 'var(--color-neutral-50, #f8fafc)', border: '1px solid var(--color-neutral-200)' }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-neutral-600)' }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-900)', marginTop: '0.2rem' }}>{value}</div>
    </div>
  );
  const statusColor = { PENDING: ['#fef3c7', '#92400e'], PAID: ['#dcfce7', '#166534'], CANCELLED: ['#f1f5f9', '#475569'] } as const;

  return (
    <section aria-labelledby="referral-title">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Gift size={32} color="var(--color-primary-500)" />
        <h3 id="referral-title" style={{ color: 'var(--color-neutral-800)', margin: 0, fontSize: '1.5rem' }}>{t('referral.title')}</h3>
      </div>
      <p style={{ color: 'var(--color-neutral-700)', marginTop: 0 }}>{t('referral.intro')}</p>
      {offers.length > 0 && (
        <ul style={{ margin: '0 0 1rem', paddingLeft: '1.2rem', color: 'var(--color-neutral-700)', lineHeight: 1.7 }}>
          {offers.map((o) => <li key={o}>{o}</li>)}
          {c.minInvestment > 0 && <li>{t('referral.offers.condition', { amount: money(c.minInvestment) })}</li>}
        </ul>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem', borderRadius: 12, border: '1px dashed var(--color-primary-400, #34d399)', backgroundColor: 'var(--color-primary-50)', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>{t('referral.yourCode')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--color-primary-900)' }}>{data.code}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-neutral-600)', overflowWrap: 'anywhere' }}>{link}</div>
        </div>
        <button type="button" className="btn btn-outline" onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t('referral.copied') : t('referral.copy')}
        </button>
        <button type="button" className="btn btn-primary" onClick={share} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Share2 size={16} /> {t('referral.share')}
        </button>
      </div>

      {data.referredBy && (
        <p style={{ padding: '0.75rem 1rem', borderRadius: 8, backgroundColor: '#eff6ff', color: '#1e40af', margin: '0 0 1.5rem' }}>
          {t('referral.referredBy', { name: data.referredBy })}{data.feeDiscountPercent > 0 && ` ${t('referral.discountAvailable', { percent: data.feeDiscountPercent })}`}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stat(t('referral.stats.referees'), String(data.referees.length))}
        {stat(t('referral.stats.invested'), String(data.referees.filter((r) => r.invested).length))}
        {stat(t('referral.stats.pending'), money(data.totals.pending))}
        {stat(t('referral.stats.paid'), money(data.totals.paid))}
      </div>

      {data.rewards.length > 0 && (
        <>
          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-neutral-800)' }}>{t('referral.rewardsTitle')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.5rem' }}>
            {data.rewards.map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '0.6rem 0', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)' }}>
                <span>{t(`referral.roles.${r.role}`, { name: r.referee })} · <strong>{money(r.amount)}</strong></span>
                <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: 999, backgroundColor: statusColor[r.status][0], color: statusColor[r.status][1] }}>
                  {t(`referral.statuses.${r.status}`)}{r.paidAt ? ` · ${new Date(r.paidAt).toLocaleDateString(i18n.language)}` : ''}
                  {r.status === 'PENDING' && r.eligibleAt && new Date(r.eligibleAt) > new Date() ? ` · ${t('referral.eligibleFrom', { date: new Date(r.eligibleAt).toLocaleDateString(i18n.language) })}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
            {t('referral.payoutHint')} <Link to="/mon-profil">{t('referral.payoutLink')}</Link>
          </p>
        </>
      )}

      {data.referees.length > 0 && (
        <>
          <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--color-neutral-800)' }}>{t('referral.refereesTitle')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.referees.map((r, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)', fontSize: '0.92rem' }}>
                <span>{r.name} · {new Date(r.joinedAt).toLocaleDateString(i18n.language)}</span>
                <span style={{ color: r.invested ? '#166534' : 'var(--color-neutral-500)' }}>{t(r.invested ? 'referral.invested' : 'referral.notInvested')}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: '1.5rem' }}>
        {t('referral.terms')} <Link to="/cgu-cgv">{t('referral.termsLink')}</Link>
      </p>
    </section>
  );
};

export default ReferralPanel;
