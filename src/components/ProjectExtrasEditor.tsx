import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL, authHeaders } from '../config/api';

export interface ProjectExtras {
  videoUrl: string;
  riskFactors: string;
  timeline: { date: string; title: string }[];
  faq: { question: string; answer: string }[];
}

interface Props {
  value: ProjectExtras;
  onChange: (value: ProjectExtras) => void;
  /** Projet existant : photos déjà en ligne, retirables immédiatement. */
  projectId?: string;
  gallery?: string[];
  newPhotos: File[];
  onNewPhotos: (files: File[]) => void;
}

const field = { width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-400)', backgroundColor: 'white', fontFamily: 'inherit' };
const label = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-neutral-800)' } as const;
const smallButton = { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem' };

/** Vidéo, risques, calendrier, FAQ et galerie d'un projet (formulaire admin et porteur). */
const ProjectExtrasEditor = ({ value, onChange, projectId, gallery = [], newPhotos, onNewPhotos }: Props) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [photos, setPhotos] = useState<string[]>(gallery);

  const set = <K extends keyof ProjectExtras>(key: K, v: ProjectExtras[K]) => onChange({ ...value, [key]: v });

  const removePhoto = async (url: string) => {
    if (!projectId) return;
    const res = await fetch(`${API_URL}/projects/${projectId}/gallery`, {
      method: 'DELETE',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) setPhotos((p) => p.filter((u) => u !== url));
  };

  const rows = <T extends Record<string, string>>(
    key: 'timeline' | 'faq',
    items: T[],
    columns: { name: keyof T & string; label: string; multiline?: boolean }[],
    empty: T,
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {columns.map((c) => {
            const update = (v: string) => set(key, items.map((it, j) => (j === i ? { ...it, [c.name]: v } : it)) as any);
            return c.multiline ? (
              <textarea key={c.name} aria-label={c.label} placeholder={c.label} rows={2} value={item[c.name]} onChange={(e) => update(e.target.value)} style={{ ...field, flex: '2 1 260px' }} />
            ) : (
              <input key={c.name} aria-label={c.label} placeholder={c.label} value={item[c.name]} onChange={(e) => update(e.target.value)} style={{ ...field, flex: '1 1 180px' }} />
            );
          })}
          <button type="button" onClick={() => set(key, items.filter((_, j) => j !== i) as any)} className="btn btn-outline" aria-label={t('admin.projectForm.removeRow')} style={smallButton}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {items.length < 20 && (
        <button type="button" onClick={() => set(key, [...items, empty] as any)} className="btn btn-outline" style={{ ...smallButton, alignSelf: 'flex-start' }}>
          <Plus size={14} /> {t('admin.projectForm.addRow')}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={label} htmlFor="project-video">{t('admin.projectForm.video')}</label>
        <input id="project-video" type="url" placeholder="https://www.youtube.com/watch?v=…" value={value.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} style={field} />
      </div>

      <div>
        <label style={label} htmlFor="project-risks">{t('admin.projectForm.riskFactors')}</label>
        <textarea id="project-risks" rows={3} maxLength={3000} value={value.riskFactors} onChange={(e) => set('riskFactors', e.target.value)} style={field} />
        <small style={{ display: 'block', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>{t('admin.projectForm.riskFactorsHint')}</small>
      </div>

      <div>
        <span style={label}>{t('admin.projectForm.timeline')}</span>
        {rows('timeline', value.timeline, [
          { name: 'date', label: t('admin.projectForm.timelineDate') },
          { name: 'title', label: t('admin.projectForm.timelineStep') },
        ], { date: '', title: '' })}
      </div>

      <div>
        <span style={label}>{t('admin.projectForm.faq')}</span>
        {rows('faq', value.faq, [
          { name: 'question', label: t('admin.projectForm.faqQuestion') },
          { name: 'answer', label: t('admin.projectForm.faqAnswer'), multiline: true },
        ], { question: '', answer: '' })}
      </div>

      <div>
        <label style={label} htmlFor="project-gallery">{t('admin.projectForm.gallery')}</label>
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {photos.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                <button type="button" onClick={() => removePhoto(url)} aria-label={t('admin.projectForm.galleryRemove')} title={t('admin.projectForm.galleryRemove')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '2px 4px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <input id="project-gallery" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => onNewPhotos(Array.from(e.target.files || []).slice(0, Math.max(0, 12 - photos.length)))} />
        {newPhotos.length > 0 && <small style={{ display: 'block', color: 'var(--color-primary-600)', marginTop: '0.35rem' }}>{t('admin.projectForm.galleryPending', { count: newPhotos.length })}</small>}
      </div>
    </div>
  );
};

export default ProjectExtrasEditor;
