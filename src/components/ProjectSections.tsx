import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSiteSettings } from '../context/SettingsContext';
import { formatMoney } from '../config/api';
import { optimizedImage } from '../lib/images';

const card = { backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginTop: '2rem' } as const;
const heading = { fontSize: '1.25rem', marginBottom: '1rem' } as const;

/** Adresse d'intégration YouTube (sans cookie publicitaire) ou Vimeo ; null si l'adresse n'est pas reconnue. */
export function videoEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d{6,})/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export const ProjectVideo = ({ url }: { url?: string | null }) => {
  const { t } = useTranslation();
  const src = videoEmbedUrl(url);
  if (!src) return null;
  return (
    <section style={card}>
      <h2 style={heading}>{t('projectDetails.videoTitle')}</h2>
      <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#000' }}>
        <iframe
          src={src}
          title={t('projectDetails.videoTitle')}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    </section>
  );
};

/** Galerie de photos avec visionneuse (clavier : flèches et Échap). */
export const ProjectGallery = ({ photos }: { photos?: string[] }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const list = photos ?? [];

  // Liste rafraîchie en direct pendant l'affichage : la visionneuse se ferme si la photo n'existe plus.
  useEffect(() => {
    if (open !== null && open >= list.length) setOpen(null);
  }, [open, list.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % list.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + list.length) % list.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, list.length]);

  if (!list.length) return null;
  const navButton = { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <section style={card}>
      <h2 style={heading}>{t('projectDetails.galleryTitle')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
        {list.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} style={{ padding: 0, border: 'none', cursor: 'zoom-in', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '4 / 3' }}>
            <img src={optimizedImage(src, 400)} alt={t('projectDetails.photo', { n: i + 1 })} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        ))}
      </div>
      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" aria-label={t('projectDetails.galleryTitle')} onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <img src={optimizedImage(list[open], 1600)} alt={t('projectDetails.photo', { n: open + 1 })} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px' }} />
          <button type="button" aria-label={t('projectDetails.close')} onClick={() => setOpen(null)} style={{ ...navButton, top: '1.5rem', right: '1.5rem', transform: 'none' }}><X size={22} /></button>
          {list.length > 1 && (
            <>
              <button type="button" aria-label={t('projectDetails.previous')} onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }} style={{ ...navButton, left: '1rem' }}><ChevronLeft size={26} /></button>
              <button type="button" aria-label={t('projectDetails.next')} onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }} style={{ ...navButton, right: '1rem' }}><ChevronRight size={26} /></button>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export const ProjectTimeline = ({ items }: { items?: { date: string; title: string }[] | null }) => {
  const { t } = useTranslation();
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <section style={card}>
      <h2 style={heading}>{t('projectDetails.timelineTitle')}</h2>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '2px solid var(--color-primary-200, #a7f3d0)' }}>
        {items.map((item, i) => (
          <li key={`${item.date}-${i}`} style={{ position: 'relative', padding: '0 0 1.25rem 1.25rem' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '-7px', top: '0.3rem', width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-primary-600)' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>{item.date}</div>
            <div style={{ color: 'var(--color-neutral-800)' }}>{item.title}</div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export const ProjectFaq = ({ items }: { items?: { question: string; answer: string }[] | null }) => {
  const { t } = useTranslation();
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <section style={card}>
      <h2 style={heading}>{t('projectDetails.faqTitle')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <details key={i} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', padding: '0.75rem 1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{item.question}</summary>
            <p style={{ margin: '0.75rem 0 0', color: 'var(--color-neutral-700)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

/**
 * Fiche d'informations clés : l'essentiel avant d'investir (inspirée de la fiche KIIS européenne),
 * calculée à partir du projet et des paramètres de la plateforme (frais, seuil, rétractation).
 */
export const KeyInformation = ({ project }: { project: any }) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const money = (v: number) => formatMoney(v, i18n.language);
  const rows: [string, string][] = [
    [t('projectDetails.keyInfo.asset'), `${project.assetType} · ${project.location}`],
    [t('projectDetails.keyInfo.target'), money(project.target)],
    [t('projectDetails.keyInfo.minTicket'), money(project.minTicket)],
    [t('projectDetails.keyInfo.return'), `${project.returnRate} % · ${t(`projectDetails.returnType.${project.returnType || 'FIXED'}`)}`],
    [t('projectDetails.keyInfo.duration'), t('projectDetails.months', { count: project.duration })],
    [t('projectDetails.keyInfo.deadline'), project.fundingDeadline ? new Date(project.fundingDeadline).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }) : t('projectDetails.keyInfo.noDeadline')],
    [t('projectDetails.keyInfo.success'), t('projectDetails.keyInfo.successValue', { percent: settings.successThresholdPercent })],
    [t('projectDetails.keyInfo.fees'), settings.investorFeePercent > 0 ? t('projectDetails.keyInfo.feesValue', { percent: settings.investorFeePercent }) : t('projectDetails.keyInfo.noFees')],
    [t('projectDetails.keyInfo.reflection'), settings.reflectionPeriodDays > 0 ? t('projectDetails.keyInfo.reflectionValue', { count: settings.reflectionPeriodDays }) : t('projectDetails.keyInfo.noReflection')],
  ];
  return (
    <section style={{ ...card, backgroundColor: 'white', border: '1px solid var(--color-neutral-200)' }} aria-labelledby="key-info-title">
      <h2 id="key-info-title" style={{ ...heading, marginBottom: '0.25rem' }}>{t('projectDetails.keyInfo.title')}</h2>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>{t('projectDetails.keyInfo.subtitle')}</p>
      <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2fr', gap: '0.6rem 1rem', margin: 0 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'contents' }}>
            <dt style={{ color: 'var(--color-neutral-600)', fontWeight: 600 }}>{label}</dt>
            <dd style={{ margin: 0 }}>{value}</dd>
          </div>
        ))}
      </dl>
      <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem', color: '#92400e' }}>{t('projectDetails.keyInfo.risks')}</h3>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{t('projectDetails.keyInfo.genericRisks')}</p>
      {project.riskFactors && <p style={{ margin: '0.5rem 0 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{project.riskFactors}</p>}
      <Link to="/cgu-cgv" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>{t('projectDetails.keyInfo.readTerms')}</Link>
    </section>
  );
};
