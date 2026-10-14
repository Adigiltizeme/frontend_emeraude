import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, FileText, Trash2, Upload } from 'lucide-react';
import { API_URL, authHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useSiteSettings } from '../../context/SettingsContext';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';
import { compactFieldStyle, labelStyle } from '../../config/formStyles';

/** Mêmes valeurs que l'API (src/dossier/dossier.constants.ts). */
export const DOSSIER_KINDS = ['STATUTES', 'TRADE_REGISTER', 'TAX_ID', 'MANAGER_ID', 'LAND_TITLE', 'BUILDING_PERMIT', 'FINANCING_PLAN', 'OTHER'] as const;

interface DossierDocument {
  id: string; kind: string; fileName: string | null; url: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; reviewComment: string | null; createdAt: string;
}

const BADGES: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#fef3c7', fg: '#92400e' },
  ACCEPTED: { bg: '#dcfce7', fg: '#166534' },
  REJECTED: { bg: '#fee2e2', fg: '#991b1b' },
};

/**
 * Pièces du dossier d'un projet (KYB). Porteur : dépôt et retrait tant que le projet est en étude.
 * Admin : dépôt, acceptation ou refus motivé de chaque pièce.
 */
const DossierDocuments = ({ projectId, admin = false, editable }: { projectId: string; admin?: boolean; editable: boolean }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { socket } = useSocket();
  const { settings } = useSiteSettings();
  const [docs, setDocs] = useState<DossierDocument[]>([]);
  const [kind, setKind] = useState<string>('STATUTES');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`${API_URL}/projects/${projectId}/dossier/documents`, { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && setDocs(data))
      .catch(() => {});
  }, [projectId, token]);
  useEffect(() => { load(); }, [load]);
  // Liens signés valables 15 minutes : rechargés régulièrement.
  useLiveRefresh(load, 5 * 60_000);
  useEffect(() => {
    if (!socket) return;
    const onDossier = (e: { projectId?: string }) => { if (e?.projectId === projectId) load(); };
    socket.on('project.dossier', onDossier);
    return () => { socket.off('project.dossier', onDossier); };
  }, [socket, projectId, load]);

  const request = async (input: RequestInfo, init: RequestInit) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(input, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(' ') : data?.message || t('dossier.error'));
      load();
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    if (!file) return;
    const body = new FormData();
    body.append('kind', kind);
    body.append('file', file);
    if (await request(`${API_URL}/projects/${projectId}/dossier/documents`, { method: 'POST', headers: authHeaders(token), body })) setFile(null);
  };

  const remove = (doc: DossierDocument) => {
    if (!window.confirm(t('dossier.confirmDelete'))) return;
    request(`${API_URL}/projects/${projectId}/dossier/documents/${doc.id}`, { method: 'DELETE', headers: authHeaders(token) });
  };

  const review = (doc: DossierDocument, status: 'ACCEPTED' | 'REJECTED') => {
    let comment: string | undefined;
    if (status === 'REJECTED') {
      const answer = window.prompt(t('dossier.rejectPrompt'));
      if (!answer?.trim()) return;
      comment = answer.trim();
    }
    request(`${API_URL}/projects/${projectId}/dossier/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
  };

  const required = (settings.kybRequiredDocuments ?? []) as string[];
  const accepted = new Set(docs.filter((d) => d.status === 'ACCEPTED').map((d) => d.kind));
  const provided = new Set(docs.filter((d) => d.status !== 'REJECTED').map((d) => d.kind));
  const canUpload = admin || editable;

  return (
    <section>
      <p style={{ color: 'var(--color-neutral-600)', margin: '0 0 1rem', fontSize: '0.95rem' }}>{t(admin ? 'dossier.introAdmin' : 'dossier.intro')}</p>

      {required.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-neutral-800)' }}>{t('dossier.required')}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem' }}>
            {required.map((k) => (
              <li key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: accepted.has(k) ? '#166534' : provided.has(k) ? '#92400e' : 'var(--color-neutral-600)' }}>
                {accepted.has(k) ? <CheckCircle size={16} /> : <Circle size={16} />} {t(`dossier.kinds.${k}`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {docs.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>{t('dossier.empty')}</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {docs.map((doc) => (
            <li key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-neutral-200)', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', minWidth: 0 }}>
                <FileText size={20} color="var(--color-primary-600)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{t(`dossier.kinds.${doc.kind}`)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', overflowWrap: 'anywhere' }}>
                    {doc.fileName || '—'} · {new Date(doc.createdAt).toLocaleDateString(i18n.language)}
                  </div>
                  {doc.reviewComment && <div style={{ fontSize: '0.85rem', color: doc.status === 'REJECTED' ? '#991b1b' : 'var(--color-neutral-600)', marginTop: '0.2rem' }}>{doc.reviewComment}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: BADGES[doc.status].bg, color: BADGES[doc.status].fg }}>{t(`dossier.status.${doc.status}`)}</span>
                {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>{t('dossier.view')}</a>}
                {admin && doc.status !== 'ACCEPTED' && <button type="button" disabled={busy} onClick={() => review(doc, 'ACCEPTED')} className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>{t('dossier.accept')}</button>}
                {admin && doc.status !== 'REJECTED' && <button type="button" disabled={busy} onClick={() => review(doc, 'REJECTED')} className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}>{t('dossier.reject')}</button>}
                {(admin || (editable && doc.status !== 'ACCEPTED')) && (
                  <button type="button" disabled={busy} onClick={() => remove(doc)} aria-label={t('dossier.delete')} title={t('dossier.delete')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={18} /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canUpload && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <div>
            <label htmlFor={`dossier-kind-${projectId}`} style={labelStyle}>{t('dossier.kind')}</label>
            <select id={`dossier-kind-${projectId}`} value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...compactFieldStyle, width: 'auto' }}>
              {DOSSIER_KINDS.map((k) => <option key={k} value={k}>{t(`dossier.kinds.${k}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`dossier-file-${projectId}`} style={labelStyle}>{t('dossier.file')}</label>
            <input id={`dossier-file-${projectId}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <button type="button" onClick={upload} disabled={busy || !file} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} /> {busy ? t('dossier.uploading') : t('dossier.upload')}
          </button>
          <small style={{ width: '100%', color: 'var(--color-neutral-500)' }}>{t('dossier.formats')}</small>
        </div>
      )}
      {!canUpload && !admin && <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginTop: '1rem' }}>{t('dossier.locked')}</p>}
      {error && <p role="alert" style={{ color: '#b91c1c', marginTop: '0.75rem' }}>{error}</p>}
    </section>
  );
};

export default DossierDocuments;
