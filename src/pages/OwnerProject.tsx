import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, Info, XCircle } from 'lucide-react';
import { API_URL, authHeaders, formatMoney } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import DossierDocuments from '../components/dossier/DossierDocuments';
import ProjectThread from '../components/dossier/ProjectThread';
import ProjectUpdatesFeed from '../components/ProjectUpdatesFeed';
import ProjectForm, { type ProjectDocuments } from '../components/ProjectForm';
import { uploadProjectDocuments } from '../lib/projectUploads';
import { fieldStyle } from '../config/formStyles';

type Tab = 'dossier' | 'messages' | 'updates' | 'edit';
const LIVE = ['COLLECTING', 'FUNDED', 'COMPLETED'];

/** Espace porteur : suivi d'un projet (dossier KYB, échanges avec l'équipe, compléments, actualités). */
const OwnerProject = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const [project, setProject] = useState<any | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('dossier');
  const [resubmitNote, setResubmitNote] = useState('');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/my-projects`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setProject(Array.isArray(list) ? list.find((p: any) => p.id === id) ?? null : null))
      .catch(() => setProject(null));
  }, [id, token]);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load, 15_000);
  useEffect(() => {
    if (!socket) return;
    const refresh = (e: { projectId?: string }) => { if (!e?.projectId || e.projectId === id) load(); };
    socket.on('notification.new', refresh);
    socket.on('project.updated', refresh);
    return () => { socket.off('notification.new', refresh); socket.off('project.updated', refresh); };
  }, [socket, id, load]);

  if (project === undefined) return <div className="dashboard-container"><p>{t('ownerProject.loading')}</p></div>;
  if (project === null) {
    return (
      <div className="dashboard-container">
        <p>{t('ownerProject.notFound')}</p>
        <Link to="/mon-compte?onglet=projets" className="btn btn-outline">{t('ownerProject.back')}</Link>
      </div>
    );
  }

  const inStudy = ['SUBMITTED', 'DRAFT'].includes(project.status);
  const editable = project.status === 'SUBMITTED' || (project.status === 'DRAFT' && !!project.infoRequestedAt);
  const tabs: Tab[] = ['dossier', 'messages', ...(LIVE.includes(project.status) ? ['updates' as Tab] : []), ...(editable ? ['edit' as Tab] : [])];
  const activeTab = tabs.includes(tab) ? tab : 'dossier';

  const resubmit = async () => {
    setNotice(null);
    const res = await fetch(`${API_URL}/projects/${id}/dossier/resubmit`, {
      method: 'POST',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: resubmitNote || undefined }),
    });
    setNotice(res.ok ? { ok: true, text: t('ownerProject.resubmitted') } : { ok: false, text: t('ownerProject.error') });
    setResubmitNote('');
    load();
  };

  const saveEdit = async (data: any, imageFile: File | null, documents: ProjectDocuments) => {
    setNotice(null);
    const res = await fetch(`${API_URL}/projects/${id}/owner`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice({ ok: false, text: Array.isArray(json?.message) ? json.message.join(' ') : json?.message || t('ownerProject.error') });
      throw new Error('save');
    }
    if (imageFile) {
      const body = new FormData();
      body.append('file', imageFile);
      await fetch(`${API_URL}/projects/${id}/image`, { method: 'POST', headers: authHeaders(token), body });
    }
    const failed = await uploadProjectDocuments(id!, token, documents);
    setNotice(failed.length ? { ok: false, text: t('ownerProject.partialUpload') } : { ok: true, text: t('ownerProject.saved') });
    load();
  };

  const tabStyle = (active: boolean) => ({
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', marginBottom: '-2px',
    borderBottom: active ? '3px solid var(--color-primary-600)' : '3px solid transparent',
    color: active ? 'var(--color-primary-800)' : 'var(--color-neutral-500)', fontWeight: active ? 700 : 500,
  });

  return (
    <div className="dashboard-container">
      <Link to="/mon-compte?onglet=projets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary-700)', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> {t('ownerProject.back')}
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-primary-900)' }}>{project.title}</h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-neutral-600)' }}>
            {t('ownerProject.target', { amount: formatMoney(project.target || 0, i18n.language) })}
            {LIVE.includes(project.status) && ` · ${t('ownerProject.raised', { amount: formatMoney(project.raised || 0, i18n.language) })}`}
          </p>
        </div>
        <span style={{ padding: '0.35rem 0.8rem', borderRadius: '999px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-800)', fontWeight: 700 }}>{t(`ownerProject.status.${project.status}`, { defaultValue: project.status })}</span>
      </div>

      {project.status === 'REJECTED' && (
        <div role="alert" style={{ display: 'flex', gap: '0.75rem', padding: '1rem', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '1.5rem' }}>
          <XCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>{t('ownerProject.rejectedTitle')}</strong>
            {project.rejectionReason && <p style={{ margin: '0.35rem 0 0', whiteSpace: 'pre-wrap' }}>{project.rejectionReason}</p>}
            <p style={{ margin: '0.35rem 0 0' }}>{t('ownerProject.rejectedHelp')}</p>
          </div>
        </div>
      )}

      {inStudy && project.infoRequestedAt && (
        <div role="alert" style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}><AlertTriangle size={20} /><strong>{t('ownerProject.infoRequestedTitle')}</strong></div>
          {project.infoRequestNote && <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap', color: 'var(--color-neutral-800)' }}>{project.infoRequestNote}</p>}
          <p style={{ margin: '0 0 0.75rem' }}>{t('ownerProject.infoRequestedHelp')}</p>
          <label htmlFor="resubmit-note" style={{ position: 'absolute', left: '-10000px' }}>{t('ownerProject.resubmitNote')}</label>
          <textarea id="resubmit-note" rows={2} maxLength={2000} value={resubmitNote} onChange={(e) => setResubmitNote(e.target.value)} placeholder={t('ownerProject.resubmitNote')} style={{ ...fieldStyle, resize: 'vertical', marginBottom: '0.6rem' }} />
          <button type="button" className="btn btn-primary" onClick={resubmit}>{t('ownerProject.resubmit')}</button>
        </div>
      )}

      {inStudy && !project.infoRequestedAt && (
        <p style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-neutral-600)', marginBottom: '1.5rem' }}>
          <Info size={18} /> {t(project.status === 'SUBMITTED' ? 'ownerProject.submittedHelp' : 'ownerProject.studyHelp')}
        </p>
      )}

      {notice && <p role={notice.ok ? 'status' : 'alert'} style={{ color: notice.ok ? '#166534' : '#b91c1c', marginBottom: '1rem' }}>{notice.text}</p>}

      <div role="tablist" className="tabs-container">
        {tabs.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={activeTab === k} onClick={() => setTab(k)} style={tabStyle(activeTab === k)}>{t(`ownerProject.tabs.${k}`)}</button>
        ))}
      </div>

      <div className="card-padding" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)' }}>
        {activeTab === 'dossier' && <DossierDocuments projectId={project.id} editable={inStudy} />}
        {activeTab === 'messages' && <ProjectThread projectId={project.id} />}
        {activeTab === 'updates' && <ProjectUpdatesFeed projectId={project.id} manage embedded />}
        {activeTab === 'edit' && editable && (
          <>
            {project.status === 'DRAFT' && <p style={{ color: 'var(--color-neutral-600)', marginTop: 0 }}>{t('ownerProject.financialLocked')}</p>}
            <ProjectForm initialData={project} onSubmit={saveEdit} submitLabel={t('ownerProject.saveEdit')} hideDeadline lockFinancial={project.status === 'DRAFT'} />
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerProject;
