import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, PiggyBank, Rocket, Sparkles, UserRound } from 'lucide-react';
import type { TourDemoData } from './tourDemo';
import { ADMIN_MENU } from '../../config/adminMenu';

type Routes = TourDemoData['__routes'];
interface Step {
  key: string;
  section: 'intro' | 'admin' | 'investor' | 'owner';
  icon: JSX.Element;
  /** Écran réel affiché (avec les données de démonstration) et zone mise en lumière. */
  route?: (r: Routes) => string;
  target?: string;
}

const ADMIN_MAIN = '[data-tour="admin-main"]';
const USER_MAIN = '.dashboard-container';

/**
 * Étapes « administration » : une par rubrique du menu du back-office (et ses sous-écrans), dans l'ordre du menu.
 * Une rubrique ajoutée au menu entre donc d'elle-même dans la visite (voir config/adminMenu.tsx).
 */
const ADMIN_STEPS: Step[] = ADMIN_MENU.flatMap((item) => (item.tour ? [
  { key: item.tour.key, section: 'admin' as const, icon: item.icon, route: () => item.path, target: ADMIN_MAIN },
  ...(item.tour.children ?? []).map((c) => ({ key: c.key, section: 'admin' as const, icon: item.icon, route: c.route, target: ADMIN_MAIN })),
] : []));

/** Étapes : écran, zone encadrée ; les textes sont dans les traductions (tour.steps.<clé>). */
const STEPS: Step[] = [
  { key: 'welcome', section: 'intro', icon: <Sparkles size={20} /> },
  ...ADMIN_STEPS,
  { key: 'investor', section: 'investor', icon: <UserRound size={20} />, route: () => '/mon-compte', target: USER_MAIN },
  { key: 'portfolio', section: 'investor', icon: <PiggyBank size={20} />, route: () => '/mon-compte', target: '[aria-labelledby="portfolio-title"]' },
  { key: 'owner', section: 'owner', icon: <BarChart3 size={20} />, route: (r) => `/mon-compte/projets/${r.owner}`, target: USER_MAIN },
  { key: 'end', section: 'intro', icon: <Rocket size={20} /> },
];

interface Rect { top: number; left: number; width: number; height: number }
const PAD = 8;

/**
 * Visite guidée en direct : chaque étape ouvre le véritable écran (alimenté par les données de démonstration),
 * encadre la zone concernée et assombrit le reste. L'écran est visible, pas utilisable (le voile capte les clics).
 * Clavier : flèches pour naviguer, Échap pour passer. Première visite obligatoire (`mandatory`) : ni « Passer », ni Échap,
 * ni saut vers une étape pas encore vue ; elle se termine par la dernière étape (onFinish(true)).
 */
const GuidedTour = ({ routes, isAdmin, mandatory, onFinish }: { routes: Routes; isAdmin: boolean; mandatory: boolean; onFinish: (completed: boolean) => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const steps = STEPS.filter((s) => isAdmin || s.section !== 'admin');
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [wide, setWide] = useState(() => window.innerWidth >= 900);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const step = steps[index];
  const last = index === steps.length - 1;
  const points = t(`tour.steps.${step.key}.points`, { returnObjects: true }) as unknown;
  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(i, steps.length - 1));
    setIndex(next);
    setReached((r) => Math.max(r, next));
  }, [steps.length]);

  // Ouverture de l'écran de l'étape.
  useEffect(() => {
    const route = step.route?.(routes);
    if (route && pathname !== route) navigate(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Zone mise en lumière : recherchée puis mesurée en continu (chargement des données, défilement, redimensionnement).
  useEffect(() => {
    setRect(null);
    if (!step.target) return;
    let found = false;
    const timeouts: number[] = [];
    // Cadrage : zone centrée si elle tient à l'écran, sinon son haut sous la barre de navigation. Répété pendant le
    // chargement, car certains écrans défilent d'eux-mêmes (fil de messages descendu au dernier message).
    const position = () => {
      const el = document.querySelector(step.target!) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const offset = r.height < window.innerHeight - 160 ? (window.innerHeight - r.height) / 2 : 80;
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - offset), behavior: 'smooth' });
    };
    const measure = () => {
      const el = document.querySelector(step.target!) as HTMLElement | null;
      if (!el) return;
      if (!found) {
        found = true;
        position();
        timeouts.push(window.setTimeout(position, 600), window.setTimeout(position, 1400));
      }
      const r = el.getBoundingClientRect();
      const top = Math.max(r.top - PAD, PAD);
      const left = Math.max(r.left - PAD, PAD);
      const bottom = Math.min(r.bottom + PAD, window.innerHeight - PAD);
      const right = Math.min(r.right + PAD, window.innerWidth - PAD);
      setRect(bottom > top && right > left ? { top, left, width: right - left, height: bottom - top } : null);
      setWide(window.innerWidth >= 900);
    };
    const timer = window.setInterval(measure, 150);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.clearInterval(timer);
      timeouts.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [step.target, pathname]);

  // Changement d'étape : le titre reçoit le focus (lecteurs d'écran, clavier).
  useEffect(() => { titleRef.current?.focus(); }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'Escape' && !mandatory) onFinish(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go, onFinish, mandatory]);

  const shade = 'rgba(15, 23, 42, 0.72)';
  const centered = !step.target;
  const cardPosition = centered
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(560px, calc(100vw - 2rem))' }
    : wide
      ? { right: 24, bottom: 24, width: 400 }
      : { left: 8, right: 8, bottom: 8 };

  return (
    // Le voile couvre toute la page : l'écran se regarde (défilement possible) mais ne s'utilise pas.
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000 }}>
      {rect ? (
        <div aria-hidden="true" style={{ position: 'fixed', ...rect, borderRadius: 12, boxShadow: `0 0 0 9999px ${shade}`, outline: '3px solid var(--color-primary-400, #34d399)', outlineOffset: 0, transition: 'top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease', pointerEvents: 'none' }} />
      ) : (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, backgroundColor: shade, transition: 'background-color 0.3s' }} />
      )}

      <div role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-text"
        style={{ position: 'fixed', ...cardPosition, maxHeight: centered ? '90vh' : wide ? '60vh' : '42vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: 16, boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ height: 5, backgroundColor: 'var(--color-neutral-100, #f1f5f9)', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          <div style={{ width: `${((index + 1) / steps.length) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary-500)', transition: 'width 0.35s ease' }} />
        </div>
        <div style={{ padding: centered ? 'clamp(1.25rem, 4vw, 2rem)' : '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 999, backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-800)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {step.icon} {t(`tour.sections.${step.section}`)}
            </span>
            <span aria-live="polite" style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{t('tour.progress', { current: index + 1, total: steps.length })}</span>
          </div>
          <h2 id="tour-title" ref={titleRef} tabIndex={-1} style={{ outline: 'none', margin: 0, fontSize: centered ? '1.45rem' : '1.15rem', color: 'var(--color-primary-900)' }}>{t(`tour.steps.${step.key}.title`)}</h2>
          <p id="tour-text" style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-700)', lineHeight: 1.6, fontSize: centered ? '1rem' : '0.93rem' }}>{t(`tour.steps.${step.key}.text`)}</p>
          {(centered || wide) && Array.isArray(points) && points.length > 0 && (
            <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', color: 'var(--color-neutral-700)', lineHeight: 1.6, fontSize: centered ? '0.95rem' : '0.88rem' }}>
              {(points as string[]).map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
          {step.route && <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>{t('tour.demoNotice')}</p>}

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.35rem', margin: '1rem 0 0.9rem' }}>
            {steps.map((s, i) => (
              <button key={s.key} type="button" aria-label={t('tour.goTo', { n: i + 1 })} aria-current={i === index ? 'step' : undefined} disabled={mandatory && i > reached} onClick={() => go(i)}
                style={{ width: i === index ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: mandatory && i > reached ? 'default' : 'pointer', padding: 0, backgroundColor: i <= index ? 'var(--color-primary-500)' : '#cbd5e1', transition: 'width 0.25s ease' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            {mandatory ? <span /> : <button type="button" className="btn btn-outline" onClick={() => onFinish(false)} style={{ border: 'none', color: 'var(--color-neutral-500)', padding: '0.5rem 0.25rem' }}>{t('tour.skip')}</button>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-outline" disabled={index === 0} onClick={() => go(index - 1)}>{t('tour.previous')}</button>
              <button type="button" className="btn btn-primary" onClick={() => (last ? onFinish(true) : go(index + 1))}>{t(last ? 'tour.finish' : 'tour.next')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
