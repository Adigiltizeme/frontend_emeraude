import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { fieldStyle, labelStyle } from '../config/formStyles';
import { ASSET_TYPES } from '../config/assetTypes';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { useSiteSettings } from '../context/SettingsContext';

interface Rule { enabled: boolean; amount: number; minReturnRate: number; maxDuration: number; assetTypes: string[]; monthlyCap: number; emailProposals: boolean }
interface Proposal {
  id: string;
  amount: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
  project: { id: string; title: string; location: string; returnRate: number; duration: number; assetType: string; minTicket: number };
}

const DEFAULT_RULE: Omit<Rule, 'amount'> = { enabled: true, minReturnRate: 0, maxDuration: 0, assetTypes: [], monthlyCap: 0, emailProposals: true };

/**
 * Investissement automatique : critères enregistrés, propositions reçues à chaque nouveau projet qui y répond.
 * L'investisseur confirme chaque proposition (et paie) : rien n'est prélevé d'office.
 */
const AutoInvestPanel = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const { settings } = useSiteSettings();
  const [rule, setRule] = useState<Rule>({ ...DEFAULT_RULE, amount: settings.defaultMinTicket });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [accepted, setAccepted] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback((withRule = false) => {
    if (!token) return;
    fetch(`${API_URL}/auto-invest/me`, { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (withRule && data.rule) setRule({ ...DEFAULT_RULE, amount: settings.defaultMinTicket, ...data.rule });
        setProposals(data.proposals ?? []);
        setAccepted(data.acceptedThisMonth ?? 0);
        setLoaded(true);
      })
      .catch(() => null);
  }, [token]);
  useEffect(() => { load(true); }, [load]);
  // Propositions : rechargées à l'arrivée d'une notification et régulièrement (le formulaire n'est pas écrasé).
  useLiveRefresh(() => load(false), 15_000);
  useEffect(() => {
    if (!socket) return;
    const onNotification = () => load(false);
    socket.on('notification.new', onNotification);
    return () => { socket.off('notification.new', onNotification); };
  }, [socket, load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`${API_URL}/auto-invest/me`, { method: 'PUT', headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(rule) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSaving(false);
    setMessage(res?.ok ? { ok: true, text: t(rule.enabled ? 'autoInvest.saved' : 'autoInvest.paused') } : { ok: false, text: Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('autoInvest.error') });
  };

  const decline = async (id: string) => {
    await fetch(`${API_URL}/auto-invest/proposals/${id}/decline`, { method: 'POST', headers: authHeaders(token) }).catch(() => null);
    load(false);
  };

  const num = (value: string) => (value === '' ? 0 : Math.max(0, Math.round(Number(value))));
  const money = (v: number) => formatMoney(v, i18n.language);
  const toggleType = (type: string) => setRule((r) => ({ ...r, assetTypes: r.assetTypes.includes(type) ? r.assetTypes.filter((a) => a !== type) : [...r.assetTypes, type] }));
  const badge = { PROPOSED: ['#dbeafe', '#1e40af'], ACCEPTED: ['#dcfce7', '#166534'], DECLINED: ['#f1f5f9', '#475569'], EXPIRED: ['#f1f5f9', '#475569'] } as const;

  if (!loaded) return <p role="status">{t('common.loading')}</p>;

  return (
    <section aria-labelledby="auto-title">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Repeat size={32} color="var(--color-primary-500)" />
        <h3 id="auto-title" style={{ color: 'var(--color-neutral-800)', margin: 0, fontSize: '1.5rem' }}>{t('autoInvest.title')}</h3>
      </div>
      <p style={{ color: 'var(--color-neutral-700)', marginTop: 0 }}>{t('autoInvest.intro')}</p>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--color-neutral-200)', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" name="enabled" checked={rule.enabled} onChange={(e) => setRule({ ...rule, enabled: e.target.checked })} />
          {t('autoInvest.enabled')}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="auto-amount" style={labelStyle}>{t('autoInvest.amount')}</label>
            <input id="auto-amount" name="amount" type="number" inputMode="numeric" min={1000} step={1000} required className="form-control" value={rule.amount || ''} onChange={(e) => setRule({ ...rule, amount: num(e.target.value) })} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="auto-rate" style={labelStyle}>{t('autoInvest.minReturnRate')}</label>
            <input id="auto-rate" name="minReturnRate" type="number" min={0} max={100} step={0.5} className="form-control" value={rule.minReturnRate || ''} placeholder="0" onChange={(e) => setRule({ ...rule, minReturnRate: Math.max(0, Number(e.target.value) || 0) })} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="auto-duration" style={labelStyle}>{t('autoInvest.maxDuration')}</label>
            <input id="auto-duration" name="maxDuration" type="number" min={0} max={600} className="form-control" value={rule.maxDuration || ''} placeholder="0" onChange={(e) => setRule({ ...rule, maxDuration: num(e.target.value) })} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="auto-cap" style={labelStyle}>{t('autoInvest.monthlyCap')}</label>
            <input id="auto-cap" name="monthlyCap" type="number" min={0} step={1000} className="form-control" value={rule.monthlyCap || ''} placeholder="0" onChange={(e) => setRule({ ...rule, monthlyCap: num(e.target.value) })} style={fieldStyle} />
          </div>
        </div>
        <small style={{ color: 'var(--color-neutral-500)', marginTop: '-0.5rem' }}>{t('autoInvest.zeroHint')}</small>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ ...labelStyle, marginBottom: '0.4rem' }}>{t('autoInvest.assetTypes')}</legend>
          <div style={{ display: 'flex', gap: '0.5rem 1rem', flexWrap: 'wrap' }}>
            {ASSET_TYPES.map((type) => (
              <label key={type} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" name="assetTypes" value={type} checked={rule.assetTypes.includes(type)} onChange={() => toggleType(type)} />
                {t(`autoInvest.types.${type}`, { defaultValue: type })}
              </label>
            ))}
          </div>
          <small style={{ color: 'var(--color-neutral-500)' }}>{t('autoInvest.allTypes')}</small>
        </fieldset>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" name="emailProposals" checked={rule.emailProposals} onChange={(e) => setRule({ ...rule, emailProposals: e.target.checked })} />
          {t('autoInvest.emailProposals')}
        </label>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
          {t('autoInvest.never')}{rule.monthlyCap > 0 && ` ${t('autoInvest.capUsage', { used: money(accepted), cap: money(rule.monthlyCap) })}`}
        </p>
        {message && <p role={message.ok ? 'status' : 'alert'} style={{ margin: 0, padding: '0.6rem 0.9rem', borderRadius: 8, backgroundColor: message.ok ? '#f0fdf4' : '#fef2f2', color: message.ok ? '#166534' : '#991b1b' }}>{message.text}</p>}
        <div><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('autoInvest.saving') : t('autoInvest.save')}</button></div>
      </form>

      <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-neutral-800)' }}>{t('autoInvest.proposals')}</h4>
      {proposals.length === 0 ? <p style={{ color: 'var(--color-neutral-500)' }}>{t('autoInvest.noProposals')}</p> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {proposals.map((p) => (
            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.85rem 0', borderBottom: '1px solid var(--color-neutral-100, #f1f5f9)' }}>
              <div style={{ minWidth: 0 }}>
                <Link to={`/projet/${p.project.id}`} style={{ fontWeight: 600, color: 'var(--color-primary-800)' }}>{p.project.title}</Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
                  {p.project.location} · {t('autoInvest.projectLine', { rate: p.project.returnRate, duration: p.project.duration })} · <strong>{money(p.amount)}</strong>
                </div>
              </div>
              {p.status === 'PROPOSED' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/projet/${p.project.id}?montant=${p.amount}`} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem' }}>{t('autoInvest.invest')}</Link>
                  <button type="button" className="btn btn-outline" onClick={() => decline(p.id)} style={{ padding: '0.45rem 0.9rem' }}>{t('autoInvest.decline')}</button>
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: 999, backgroundColor: badge[p.status][0], color: badge[p.status][1] }}>{t(`autoInvest.statuses.${p.status}`)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AutoInvestPanel;
