import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Building2, Coins, FolderOpen, Headset, KeyRound, LayoutDashboard, Megaphone, PiggyBank, Rocket,
  Settings, Sparkles, UserRound, Users, Wallet,
} from 'lucide-react';

/** Étapes de la visite : section, icône ; les textes sont dans les traductions (tour.steps.<clé>). */
const STEPS: { key: string; section: 'intro' | 'admin' | 'investor' | 'owner'; icon: JSX.Element }[] = [
  { key: 'welcome', section: 'intro', icon: <Sparkles size={34} /> },
  { key: 'dashboard', section: 'admin', icon: <LayoutDashboard size={34} /> },
  { key: 'projects', section: 'admin', icon: <Building2 size={34} /> },
  { key: 'dossier', section: 'admin', icon: <FolderOpen size={34} /> },
  { key: 'investments', section: 'admin', icon: <Wallet size={34} /> },
  { key: 'distributions', section: 'admin', icon: <Coins size={34} /> },
  { key: 'users', section: 'admin', icon: <Users size={34} /> },
  { key: 'support', section: 'admin', icon: <Headset size={34} /> },
  { key: 'content', section: 'admin', icon: <Megaphone size={34} /> },
  { key: 'settings', section: 'admin', icon: <Settings size={34} /> },
  { key: 'security', section: 'admin', icon: <KeyRound size={34} /> },
  { key: 'investor', section: 'investor', icon: <UserRound size={34} /> },
  { key: 'portfolio', section: 'investor', icon: <PiggyBank size={34} /> },
  { key: 'owner', section: 'owner', icon: <BarChart3 size={34} /> },
  { key: 'end', section: 'intro', icon: <Rocket size={34} /> },
];

/** Visite guidée interactive des fonctionnalités (clavier : flèches, Échap pour passer). */
const GuidedTour = ({ onFinish }: { onFinish: () => void }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const points = t(`tour.steps.${step.key}.points`, { returnObjects: true }) as unknown;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Changement d'étape : le titre reçoit le focus (lecteurs d'écran, clavier), sauf à l'ouverture.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    titleRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, STEPS.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      if (e.key === 'Escape') onFinish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFinish]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tour-title" style={{ width: 'min(760px, 100%)', backgroundColor: 'white', borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
      <div style={{ height: 6, backgroundColor: 'var(--color-neutral-100, #f1f5f9)' }}>
        <div style={{ width: `${((index + 1) / STEPS.length) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary-500)', transition: 'width 0.35s ease' }} />
      </div>
      <div style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-800)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t(`tour.sections.${step.section}`)}
          </span>
          <span aria-live="polite" style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)' }}>{t('tour.progress', { current: index + 1, total: STEPS.length })}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div aria-hidden="true" style={{ width: 72, height: 72, borderRadius: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-800))' }}>
            {step.icon}
          </div>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h2 id="tour-title" ref={titleRef} tabIndex={-1} style={{ outline: 'none', margin: 0, fontSize: '1.5rem', color: 'var(--color-primary-900)' }}>{t(`tour.steps.${step.key}.title`)}</h2>
            <p style={{ margin: '0.6rem 0 0', color: 'var(--color-neutral-700)', lineHeight: 1.65 }}>{t(`tour.steps.${step.key}.text`)}</p>
            {Array.isArray(points) && points.length > 0 && (
              <ul style={{ margin: '0.9rem 0 0', paddingLeft: '1.2rem', color: 'var(--color-neutral-700)', lineHeight: 1.7 }}>
                {(points as string[]).map((p) => <li key={p}>{p}</li>)}
              </ul>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', margin: '1.75rem 0 1.25rem' }}>
          {STEPS.map((s, i) => (
            <button key={s.key} type="button" aria-label={t('tour.goTo', { n: i + 1 })} aria-current={i === index ? 'step' : undefined} onClick={() => setIndex(i)}
              style={{ width: i === index ? 22 : 9, height: 9, borderRadius: 5, border: 'none', cursor: 'pointer', padding: 0, backgroundColor: i <= index ? 'var(--color-primary-500)' : '#cbd5e1', transition: 'width 0.25s ease' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={onFinish} style={{ border: 'none', color: 'var(--color-neutral-500)' }}>{t('tour.skip')}</button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>{t('tour.previous')}</button>
            <button type="button" className="btn btn-primary" autoFocus onClick={() => (last ? onFinish() : setIndex(index + 1))}>{t(last ? 'tour.finish' : 'tour.next')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
