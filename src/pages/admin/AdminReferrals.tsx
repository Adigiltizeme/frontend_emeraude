import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { compactFieldStyle } from '../../config/formStyles';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

interface Overview {
  config: { enabled: boolean; referrerReward: number; refereeReward: number; feeDiscountPercent: number; minInvestment: number; maxRewards: number };
  leaderboard: { id: string; firstName: string | null; lastName: string | null; email: string; referees: number; investedReferees: number; investedAmount: number; rewardsPending: number; rewardsPaid: number }[];
  rewards: {
    id: string; userId: string; role: 'REFERRER' | 'REFEREE'; amount: number; status: 'PENDING' | 'PAID' | 'CANCELLED'; reference: string | null; note: string | null; createdAt: string; paidAt: string | null; eligibleAt: string | null;
    user: { id: string; firstName: string | null; lastName: string | null; email: string; payoutMethod: string | null; payoutDetails: string | null };
    referee: { firstName: string | null; lastName: string | null; email: string };
  }[];
}

const name = (u: { firstName: string | null; lastName: string | null; email: string }) => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

/** Parrainage : classement des parrains et primes à verser manuellement (comme les revenus). */
const AdminReferrals = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [data, setData] = useState<Overview | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/admin/referrals`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => null);
  }, [token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);
  useEffect(() => {
    if (!socket) return;
    socket.on('referral.reward', load);
    return () => { socket.off('referral.reward', load); };
  }, [socket, load]);

  const act = async (id: string, action: 'paid' | 'cancel') => {
    let body: Record<string, string>;
    if (action === 'paid') {
      const reference = references[id]?.trim();
      if (!reference) { setMessage({ ok: false, text: t('admin.referrals.referenceRequired') }); return; }
      body = { reference };
    } else {
      const reason = window.prompt(t('admin.referrals.cancelReason'));
      if (!reason) return;
      body = { reason };
    }
    const res = await fetch(`${API_URL}/admin/referrals/rewards/${id}/${action}`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    const result = await res?.json().catch(() => null);
    setMessage(res?.ok ? { ok: true, text: t(action === 'paid' ? 'admin.referrals.paidDone' : 'admin.referrals.cancelDone') } : { ok: false, text: result?.message || t('admin.referrals.error') });
    load();
  };

  if (!data) return <p role="status">{t('common.loading')}</p>;
  const money = (v: number) => formatMoney(v, i18n.language);
  const card = { backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' };
  const th = { textAlign: 'left' as const, padding: '0.6rem', borderBottom: '2px solid var(--color-neutral-200)', color: 'var(--color-neutral-600)', fontSize: '0.85rem' };
  const td = { padding: '0.6rem', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)', verticalAlign: 'top' as const };
  const rewards = data.rewards.filter((r) => filter === 'ALL' || r.status === 'PENDING');
  const cfg = data.config;

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ color: 'var(--color-primary-900)', marginTop: 0 }}>{t('admin.referrals.title')}</h1>
      <p style={{ color: 'var(--color-neutral-600)' }}>
        {cfg.enabled
          ? t('admin.referrals.summary', { referrer: money(cfg.referrerReward), referee: money(cfg.refereeReward), discount: cfg.feeDiscountPercent, min: money(cfg.minInvestment) })
          : t('admin.referrals.disabled')}{' '}
        <Link to="/admin/settings">{t('admin.referrals.settingsLink')}</Link>
      </p>
      {message && <p role={message.ok ? 'status' : 'alert'} style={{ padding: '0.75rem 1rem', borderRadius: 8, backgroundColor: message.ok ? '#f0fdf4' : '#fef2f2', color: message.ok ? '#166534' : '#991b1b' }}>{message.text}</p>}

      <section style={card} aria-labelledby="rewards-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <h2 id="rewards-title" style={{ margin: 0, fontSize: '1.2rem' }}>{t('admin.referrals.rewards')}</h2>
          <div role="tablist" style={{ display: 'flex', gap: '0.4rem' }}>
            {(['PENDING', 'ALL'] as const).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={filter === f ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.35rem 0.9rem' }}>{t(`admin.referrals.filters.${f}`)}</button>
            ))}
          </div>
        </div>
        {rewards.length === 0 ? <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>{t('admin.referrals.noRewards')}</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead><tr>
                <th style={th}>{t('admin.referrals.cols.beneficiary')}</th>
                <th style={th}>{t('admin.referrals.cols.reason')}</th>
                <th style={th}>{t('admin.referrals.cols.amount')}</th>
                <th style={th}>{t('admin.referrals.cols.payout')}</th>
                <th style={th}>{t('admin.referrals.cols.status')}</th>
              </tr></thead>
              <tbody>
                {rewards.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>{name(r.user)}<div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{r.user.email}</div></td>
                    <td style={td}>{t(`admin.referrals.roles.${r.role}`, { name: name(r.referee) })}<div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{new Date(r.createdAt).toLocaleDateString(i18n.language)}</div></td>
                    <td style={{ ...td, fontWeight: 600 }}>{money(r.amount)}</td>
                    <td style={td}>{r.user.payoutMethod ? `${t(`payoutAccount.methods.${r.user.payoutMethod}`, { defaultValue: r.user.payoutMethod })} · ${r.user.payoutDetails ?? ''}` : <span style={{ color: '#b45309' }}>{t('admin.referrals.noPayout')}</span>}</td>
                    <td style={td}>
                      {r.status === 'PENDING' && r.eligibleAt && new Date(r.eligibleAt) > new Date() ? (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-neutral-600)' }}>{t('admin.referrals.eligibleFrom', { date: new Date(r.eligibleAt).toLocaleDateString(i18n.language) })}</span>
                          <button type="button" className="btn btn-outline" onClick={() => act(r.id, 'cancel')} style={{ padding: '0.4rem 0.8rem' }}>{t('admin.referrals.cancel')}</button>
                        </div>
                      ) : r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <label htmlFor={`ref-${r.id}`} style={{ position: 'absolute', left: '-10000px' }}>{t('admin.referrals.reference')}</label>
                          <input id={`ref-${r.id}`} name={`reference-${r.id}`} className="form-control" placeholder={t('admin.referrals.reference')} value={references[r.id] ?? ''} onChange={(e) => setReferences({ ...references, [r.id]: e.target.value })} style={{ ...compactFieldStyle, width: 160 }} />
                          <button type="button" className="btn btn-primary" onClick={() => act(r.id, 'paid')} style={{ padding: '0.4rem 0.8rem' }}>{t('admin.referrals.markPaid')}</button>
                          <button type="button" className="btn btn-outline" onClick={() => act(r.id, 'cancel')} style={{ padding: '0.4rem 0.8rem' }}>{t('admin.referrals.cancel')}</button>
                        </div>
                      ) : (
                        <span>{t(`admin.referrals.statuses.${r.status}`)}{r.reference ? ` · ${r.reference}` : ''}{r.note ? ` · ${r.note}` : ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card} aria-labelledby="leaderboard-title">
        <h2 id="leaderboard-title" style={{ marginTop: 0, fontSize: '1.2rem' }}>{t('admin.referrals.leaderboard')}</h2>
        {data.leaderboard.length === 0 ? <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>{t('admin.referrals.noReferrers')}</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead><tr>
                <th style={th}>#</th>
                <th style={th}>{t('admin.referrals.cols.referrer')}</th>
                <th style={th}>{t('admin.referrals.cols.referees')}</th>
                <th style={th}>{t('admin.referrals.cols.investedReferees')}</th>
                <th style={th}>{t('admin.referrals.cols.investedAmount')}</th>
                <th style={th}>{t('admin.referrals.cols.rewards')}</th>
              </tr></thead>
              <tbody>
                {data.leaderboard.map((l, i) => (
                  <tr key={l.id}>
                    <td style={td}>{i + 1}</td>
                    <td style={td}>{name(l)}<div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{l.email}</div></td>
                    <td style={td}>{l.referees}</td>
                    <td style={td}>{l.investedReferees}</td>
                    <td style={td}>{money(l.investedAmount)}</td>
                    <td style={td}>{t('admin.referrals.rewardTotals', { paid: money(l.rewardsPaid), pending: money(l.rewardsPending) })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReferrals;
