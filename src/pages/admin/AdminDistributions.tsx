import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { compactFieldStyle, fieldStyle, labelStyle } from '../../config/formStyles';

interface PayoutUser { id: string; firstName: string | null; lastName: string | null; email: string; phone?: string | null; payoutMethod: string | null; payoutDetails?: string | null }
interface Payout {
  id: string; userId: string; baseAmount: number; amount: number; user: PayoutUser;
  status: 'PENDING' | 'PAID' | 'FAILED'; reference: string | null; paidAt: string | null;
  /** Coordonnées utilisées au moment du versement (copie). */
  payoutMethod: string | null; payoutDetails: string | null;
}
interface Distribution {
  id: string; type: 'INCOME' | 'CAPITAL'; totalAmount: number; periodLabel: string | null; note: string | null; status: 'ANNOUNCED' | 'PAID' | 'CANCELLED';
  scheduledAt: string | null; paidAt: string | null; paymentReference: string | null; cancelReason: string | null; createdAt: string; payouts: Payout[];
}
interface Overview {
  project: { id: string; title: string; status: string; raised: number; target: number; returnRate: number; duration: number; distribution: string | null };
  investors: number; invested: number; incomePaid: number; capitalRepaid: number; distributions: Distribution[];
}
interface PreviewLine { userId: string; base: number; amount: number; user: PayoutUser | null }

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  ANNOUNCED: { bg: '#fef3c7', fg: '#92400e' },
  PAID: { bg: '#dcfce7', fg: '#166534' },
  CANCELLED: { bg: '#f1f5f9', fg: '#475569' },
};

/** Back-office : revenus et remboursements de capital d'un projet (répartition au prorata, versement, annulation). */
const AdminDistributions = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'INCOME', totalAmount: '', periodLabel: '', scheduledAt: '', note: '' });
  const [preview, setPreview] = useState<PreviewLine[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  // Fenêtre « marquer comme versé » : parts réellement versées (cochées) et référence du lot.
  const [paying, setPaying] = useState<Distribution | null>(null);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState('');
  const money = (v: number) => formatMoney(v, i18n.language);
  const name = (u: PayoutUser | null) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email : '—');

  const load = useCallback(() => {
    fetch(`${API_URL}/admin/projects/${id}/distributions`, { headers: authHeaders(token) })
      .then(async (r) => (r.ok ? setData(await r.json()) : setError(t('admin.distributions.loadError'))))
      .catch(() => setError(t('admin.distributions.loadError')));
  }, [id, token, t]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);

  const call = async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(json?.message) ? json.message.join(' ') : json?.message || t('admin.distributions.genericError'));
    return json;
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try { await fn(); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const doPreview = () => run(async () => {
    const result = await call(`/admin/projects/${id}/distributions/preview`, { type: form.type, totalAmount: Number(form.totalAmount) });
    setPreview(result.lines);
  });

  const doCreate = () => run(async () => {
    await call(`/admin/projects/${id}/distributions`, {
      type: form.type,
      totalAmount: Number(form.totalAmount),
      periodLabel: form.periodLabel || undefined,
      scheduledAt: form.scheduledAt ? new Date(`${form.scheduledAt}T12:00:00`).toISOString() : undefined,
      note: form.note || undefined,
    });
    setPreview(null);
    setForm({ type: 'INCOME', totalAmount: '', periodLabel: '', scheduledAt: '', note: '' });
    load();
  });

  const markPaid = (d: Distribution) => {
    // Par défaut : parts dont l'investisseur a des coordonnées de versement (les autres ne peuvent pas être versées).
    setIncluded(Object.fromEntries(d.payouts.map((p) => [p.id, !!p.user.payoutMethod])));
    setPayRef('');
    setPayDate('');
    setPaying(d);
  };

  const confirmPaid = () => {
    if (!paying || !payRef.trim()) return;
    const failedPayoutIds = paying.payouts.filter((p) => !included[p.id]).map((p) => p.id);
    run(async () => {
      await call(`/admin/distributions/${paying.id}/paid`, {
        reference: payRef.trim(),
        paidAt: payDate ? new Date(`${payDate}T12:00:00Z`).toISOString() : undefined,
        failedPayoutIds,
      });
      setPaying(null);
      load();
    });
  };

  const regularize = (p: Payout) => {
    const reference = window.prompt(t('admin.distributions.referencePrompt'));
    if (!reference?.trim()) return;
    run(async () => { await call(`/admin/payouts/${p.id}/paid`, { reference: reference.trim() }); load(); });
  };

  const cancel = (d: Distribution) => {
    const reason = window.prompt(t('admin.distributions.cancelPrompt'));
    if (!reason || reason.trim().length < 3) return;
    run(async () => { await call(`/admin/distributions/${d.id}/cancel`, { reason: reason.trim() }); load(); });
  };

  if (!data) {
    return <div style={{ maxWidth: 1100, margin: '0 auto' }}>{error ? <p role="alert" style={{ color: '#b91c1c' }}>{error}</p> : <p>{t('admin.distributions.loading')}</p>}</div>;
  }
  const canDistribute = ['FUNDED', 'COMPLETED'].includes(data.project.status);
  const previewTotal = preview?.reduce((s, l) => s + l.amount, 0) ?? 0;
  const th = { padding: '0.6rem 0.75rem', textAlign: 'left' as const, color: '#475569', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' };
  const td = { padding: '0.6rem 0.75rem', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' as const };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Link to="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary-700)', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> {t('admin.distributions.back')}
      </Link>
      <h1 style={{ color: 'var(--color-primary-900)', margin: '0 0 0.25rem' }}>{t('admin.distributions.title')}</h1>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1.5rem' }}>{data.project.title} · {t(`admin.status.${data.project.status}`)}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          ['investors', String(data.investors)],
          ['invested', money(data.invested)],
          ['incomePaid', money(data.incomePaid)],
          ['capitalRepaid', money(data.capitalRepaid)],
        ].map(([k, v]) => (
          <div key={k} style={{ backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>{t(`admin.distributions.kpi.${k}`)}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary-900)', marginTop: '0.3rem' }}>{v}</div>
          </div>
        ))}
      </div>

      {error && <p role="alert" style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px' }}>{error}</p>}

      <section style={{ backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>{t('admin.distributions.newTitle')}</h2>
        {!canDistribute ? (
          <p style={{ color: 'var(--color-neutral-600)', margin: 0 }}>{t('admin.distributions.notDistributable')}</p>
        ) : (
          <>
            <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1rem', fontSize: '0.9rem' }}>{t('admin.distributions.newIntro')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="d-type" style={labelStyle}>{t('admin.distributions.type')}</label>
                <select id="d-type" value={form.type} onChange={(e) => { setForm({ ...form, type: e.target.value }); setPreview(null); }} style={fieldStyle}>
                  <option value="INCOME">{t('admin.distributions.types.INCOME')}</option>
                  <option value="CAPITAL">{t('admin.distributions.types.CAPITAL')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="d-amount" style={labelStyle}>{t('admin.distributions.totalAmount')}</label>
                <input id="d-amount" type="number" inputMode="numeric" min={1} step={1} value={form.totalAmount} onChange={(e) => { setForm({ ...form, totalAmount: e.target.value }); setPreview(null); }} style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="d-period" style={labelStyle}>{t('admin.distributions.period')}</label>
                <input id="d-period" type="text" maxLength={60} value={form.periodLabel} placeholder={t('admin.distributions.periodPlaceholder')} onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="d-date" style={labelStyle}>{t('admin.distributions.scheduledAt')}</label>
                <input id="d-date" type="date" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} style={fieldStyle} />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="d-note" style={labelStyle}>{t('admin.distributions.note')}</label>
              <textarea id="d-note" maxLength={500} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ ...fieldStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" disabled={busy || !(Number(form.totalAmount) > 0)} onClick={doPreview}>{t('admin.distributions.preview')}</button>
              {preview && <button type="button" className="btn btn-primary" disabled={busy} onClick={doCreate}>{t('admin.distributions.confirm', { amount: money(previewTotal) })}</button>}
            </div>
            {preview && (
              <div style={{ overflowX: 'auto', marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead><tr><th style={th}>{t('admin.distributions.investor')}</th><th style={th}>{t('admin.distributions.base')}</th><th style={th}>{t('admin.distributions.share')}</th><th style={th}>{t('admin.distributions.payoutAccount')}</th></tr></thead>
                  <tbody>
                    {preview.map((l) => (
                      <tr key={l.userId}>
                        <td style={td}>{name(l.user)}</td>
                        <td style={td}>{money(l.base)}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{money(l.amount)}</td>
                        <td style={{ ...td, color: l.user?.payoutMethod ? 'inherit' : '#b45309' }}>{l.user?.payoutMethod ? t(`payoutAccount.methods.${l.user.payoutMethod}`) : t('admin.distributions.noPayoutAccount')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.75rem' }}>{t('admin.distributions.history')}</h2>
      {data.distributions.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>{t('admin.distributions.empty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.distributions.map((d) => {
            const colors = STATUS_COLORS[d.status];
            const expanded = open === d.id;
            return (
              <div key={d.id} style={{ backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {t(`admin.distributions.types.${d.type}`)} · {money(d.totalAmount)}{d.periodLabel ? ` · ${d.periodLabel}` : ''}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)', marginTop: '0.2rem' }}>
                      {d.status === 'PAID' && d.paidAt
                        ? t('admin.distributions.paidOn', { date: new Date(d.paidAt).toLocaleDateString(i18n.language), ref: d.paymentReference })
                        : d.status === 'CANCELLED'
                          ? t('admin.distributions.cancelledBecause', { reason: d.cancelReason })
                          : d.scheduledAt ? t('admin.distributions.scheduledOn', { date: new Date(d.scheduledAt).toLocaleDateString(i18n.language) }) : t('admin.distributions.notScheduled')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: colors.bg, color: colors.fg, fontSize: '0.8rem', fontWeight: 700 }}>{t(`admin.distributions.status.${d.status}`)}</span>
                    {d.status === 'PAID' && d.payouts.some((p) => p.status === 'FAILED') && (
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 700 }}>
                        {t('admin.distributions.toRegularize', { count: d.payouts.filter((p) => p.status === 'FAILED').length })}
                      </span>
                    )}
                    {d.status === 'ANNOUNCED' && (
                      <>
                        <button type="button" disabled={busy} onClick={() => markPaid(d)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}><CheckCircle size={16} /> {t('admin.distributions.markPaid')}</button>
                        <button type="button" disabled={busy} onClick={() => cancel(d)} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}><XCircle size={16} /> {t('admin.distributions.cancel')}</button>
                      </>
                    )}
                    <button type="button" onClick={() => setOpen(expanded ? null : d.id)} aria-expanded={expanded} style={{ ...compactFieldStyle, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {t('admin.distributions.shares', { count: d.payouts.length })}
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div style={{ overflowX: 'auto', borderTop: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                      <thead><tr><th style={th}>{t('admin.distributions.investor')}</th><th style={th}>{t('admin.distributions.share')}</th><th style={th}>{t('admin.distributions.payoutAccount')}</th><th style={th}>{t('admin.distributions.shareStatus')}</th></tr></thead>
                      <tbody>
                        {d.payouts.map((p) => {
                          // Part versée : coordonnées réellement utilisées (copie) ; sinon coordonnées actuelles du profil.
                          const method = p.status === 'PAID' ? p.payoutMethod : p.user.payoutMethod;
                          const details = p.status === 'PAID' ? p.payoutDetails : p.user.payoutDetails;
                          return (
                            <tr key={p.id}>
                              <td style={td}>{name(p.user)}<div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{p.user.email}{p.user.phone ? ` · ${p.user.phone}` : ''}</div></td>
                              <td style={{ ...td, fontWeight: 600 }}>{money(p.amount)}</td>
                              <td style={{ ...td, whiteSpace: 'pre-wrap' }}>
                                {method ? <><strong>{t(`payoutAccount.methods.${method}`)}</strong>{'\n'}{details}</> : <span style={{ color: '#b45309' }}>{t('admin.distributions.noPayoutAccount')}</span>}
                              </td>
                              <td style={td}>
                                <span style={{ fontWeight: 600, color: p.status === 'PAID' ? '#166534' : p.status === 'FAILED' ? '#b45309' : '#475569' }}>{t(`admin.distributions.shareStatuses.${p.status}`)}</span>
                                {p.status === 'PAID' && p.reference && <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{t('portfolio.reference', { ref: p.reference })}</div>}
                                {p.status === 'FAILED' && (
                                  <button type="button" disabled={busy || !p.user.payoutMethod} onClick={() => regularize(p)} className="btn btn-outline" style={{ display: 'block', marginTop: '0.35rem', padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>
                                    {t('admin.distributions.regularize')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {d.note && <p style={{ margin: 0, padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>{d.note}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {paying && (
        <div role="dialog" aria-modal="true" aria-labelledby="pay-title" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 id="pay-title" style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{t('admin.distributions.payTitle', { amount: money(paying.totalAmount) })}</h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--color-neutral-600)', fontSize: '0.9rem' }}>{t('admin.distributions.payIntro')}</p>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead><tr><th style={th}>{t('admin.distributions.paidColumn')}</th><th style={th}>{t('admin.distributions.investor')}</th><th style={th}>{t('admin.distributions.share')}</th><th style={th}>{t('admin.distributions.payoutAccount')}</th></tr></thead>
                <tbody>
                  {paying.payouts.map((p) => (
                    <tr key={p.id}>
                      <td style={td}>
                        <input type="checkbox" aria-label={name(p.user)} checked={!!included[p.id]} disabled={!p.user.payoutMethod} onChange={(e) => setIncluded({ ...included, [p.id]: e.target.checked })} style={{ width: '1.1rem', height: '1.1rem' }} />
                      </td>
                      <td style={td}>{name(p.user)}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{money(p.amount)}</td>
                      <td style={{ ...td, whiteSpace: 'pre-wrap' }}>
                        {p.user.payoutMethod ? <><strong>{t(`payoutAccount.methods.${p.user.payoutMethod}`)}</strong>{'\n'}{p.user.payoutDetails}</> : <span style={{ color: '#b45309' }}>{t('admin.distributions.noPayoutAccount')}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paying.payouts.some((p) => !included[p.id]) && (
              <p role="status" style={{ margin: '0 0 1rem', padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.85rem' }}>
                {t('admin.distributions.excludedWarning', { count: paying.payouts.filter((p) => !included[p.id]).length })}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="pay-ref" style={labelStyle}>{t('admin.distributions.reference')}</label>
                <input id="pay-ref" type="text" maxLength={120} value={payRef} onChange={(e) => setPayRef(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="pay-date" style={labelStyle}>{t('admin.distributions.paidDate')}</label>
                <input id="pay-date" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} style={fieldStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPaying(null)} disabled={busy}>{t('admin.distributions.close')}</button>
              <button type="button" className="btn btn-primary" onClick={confirmPaid} disabled={busy || !payRef.trim() || !paying.payouts.some((p) => included[p.id])}>
                {t('admin.distributions.confirmPaid', { count: paying.payouts.filter((p) => included[p.id]).length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDistributions;
