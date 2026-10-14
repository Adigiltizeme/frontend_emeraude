import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import DossierDocuments from '../../components/dossier/DossierDocuments';
import ProjectThread from '../../components/dossier/ProjectThread';
import ProjectUpdatesFeed from '../../components/ProjectUpdatesFeed';
import { fieldStyle, labelStyle } from '../../config/formStyles';

const LIVE = ['COLLECTING', 'FUNDED', 'COMPLETED'];

/** Back-office : étude du dossier d'un projet (pièces, échanges, compléments, décision) et actualités. */
const AdminProjectDossier = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/${id}`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setProject(data))
      .catch(() => {});
  }, [id, token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);

  const send = async (path: string, method: string, body: unknown, success: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}${path}`, { method, headers: { ...authHeaders(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = Array.isArray(data?.message) ? data.message.join(' ') : String(data?.message || t('adminDossier.error'));
        throw new Error(text.replace(/^KYB_MISSING: /, ''));
      }
      setMessage({ ok: true, text: success });
      load();
      return true;
    } catch (e: any) {
      setMessage({ ok: false, text: e.message });
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!project) return <div style={{ maxWidth: 1100, margin: '0 auto' }}><p>{t('adminDossier.loading')}</p></div>;
  const inStudy = ['SUBMITTED', 'DRAFT'].includes(project.status);
  const card = { backgroundColor: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' } as const;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Link to="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary-700)', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> {t('adminDossier.back')}
      </Link>
      <h1 style={{ color: 'var(--color-primary-900)', margin: '0 0 0.25rem' }}>{project.title}</h1>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1.5rem' }}>
        {t(`admin.status.${project.status}`, { defaultValue: project.status })} · {formatMoney(project.target || 0, i18n.language)}
        {project.owner ? ` · ${t('adminDossier.owner', { name: `${project.owner.firstName ?? ''} ${project.owner.lastName ?? ''}`.trim() || project.owner.email, email: project.owner.email })}` : ` · ${t('adminDossier.team')}`}
      </p>

      {message && <p role={message.ok ? 'status' : 'alert'} style={{ color: message.ok ? '#166534' : '#b91c1c', backgroundColor: message.ok ? '#f0fdf4' : '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px' }}>{message.text}</p>}

      {inStudy && (
        <section style={card}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem' }}>{t('adminDossier.decision')}</h2>
          {project.infoRequestedAt && (
            <p style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.6rem 0.9rem', borderRadius: '8px', margin: '0 0 1rem' }}>
              {t('adminDossier.awaitingOwner', { date: new Date(project.infoRequestedAt).toLocaleDateString(i18n.language) })}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
            {project.owner && (
              <div>
                <label htmlFor="info-note" style={labelStyle}>{t('adminDossier.requestInfo')}</label>
                <textarea id="info-note" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('adminDossier.requestInfoHint')} style={{ ...fieldStyle, resize: 'vertical' }} />
                <button type="button" disabled={busy || note.trim().length < 5} onClick={async () => { if (await send(`/projects/${id}/dossier/request-info`, 'POST', { note }, t('adminDossier.infoRequested'))) setNote(''); }} className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <HelpCircle size={16} /> {t('adminDossier.sendRequest')}
                </button>
              </div>
            )}
            <div>
              <label htmlFor="reject-reason" style={labelStyle}>{t('adminDossier.rejectReason')}</label>
              <textarea id="reject-reason" rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('adminDossier.rejectHint')} style={{ ...fieldStyle, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button type="button" disabled={busy || (!!project.owner && reason.trim().length < 3)} onClick={() => { if (window.confirm(t('adminDossier.confirmReject'))) send(`/projects/${id}`, 'PATCH', { status: 'REJECTED', rejectionReason: reason }, t('adminDossier.rejected')); }} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#b91c1c' }}>
                  <XCircle size={16} /> {t('adminDossier.reject')}
                </button>
                {project.status === 'SUBMITTED' && (
                  <button type="button" disabled={busy} onClick={() => send(`/projects/${id}`, 'PATCH', { status: 'DRAFT' }, t('adminDossier.inStudy'))} className="btn btn-outline">{t('adminDossier.startStudy')}</button>
                )}
                <button type="button" disabled={busy} onClick={() => { if (window.confirm(t('adminDossier.confirmPublish'))) send(`/projects/${id}`, 'PATCH', { status: 'COLLECTING' }, t('adminDossier.published')); }} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={16} /> {t('adminDossier.publish')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {project.status === 'REJECTED' && project.rejectionReason && (
        <section style={card}><strong>{t('adminDossier.rejectReason')}</strong><p style={{ margin: '0.35rem 0 0', whiteSpace: 'pre-wrap' }}>{project.rejectionReason}</p></section>
      )}

      <section style={card}>
        <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem' }}>{t('adminDossier.documents')}</h2>
        <DossierDocuments projectId={project.id} admin editable />
      </section>

      {project.owner && (
        <section style={card}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem' }}>{t('adminDossier.messages')}</h2>
          <ProjectThread projectId={project.id} />
        </section>
      )}

      {LIVE.includes(project.status) && (
        <section style={card}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem' }}>{t('adminDossier.updates')}</h2>
          <ProjectUpdatesFeed projectId={project.id} manage admin embedded />
        </section>
      )}
    </div>
  );
};

export default AdminProjectDossier;
