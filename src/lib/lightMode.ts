import { useEffect, useState } from 'react';

/**
 * Mode léger (CdC §4.2, connexions lentes) : pas de fond animé, carte et médias lourds seulement à la demande.
 * Automatique si le navigateur signale l'économie de données, une connexion lente ou la réduction des animations ;
 * le visiteur peut le forcer dans un sens ou dans l'autre (préférence conservée sur cet appareil).
 */
const STORAGE_KEY = 'emeraude_light_mode';
const EVENT = 'emeraude-light-mode';
type Choice = 'on' | 'off' | 'auto';

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'on' || value === 'off' ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function detectSlowConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !!connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '') || !!reducedMotion;
}

export function isLightMode(): boolean {
  const choice = readChoice();
  return choice === 'on' || (choice === 'auto' && detectSlowConnection());
}

export function setLightMode(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
}

export function useLightMode(): [boolean, (enabled: boolean) => void] {
  const [light, setLight] = useState(isLightMode);
  useEffect(() => {
    const onChange = (e: Event) => setLight((e as CustomEvent<boolean>).detail ?? isLightMode());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return [light, setLightMode];
}
