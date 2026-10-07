import { useEffect, useRef } from 'react';

/**
 * Rafraîchit des données vivantes : au retour sur l'onglet et, si `intervalMs` est fourni,
 * à intervalle régulier tant que l'onglet est visible.
 */
export function useLiveRefresh(refresh: () => void, intervalMs?: number, enabled = true) {
  const ref = useRef(refresh);
  ref.current = refresh;

  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') ref.current();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = intervalMs
      ? window.setInterval(() => {
          if (document.visibilityState === 'visible') ref.current();
        }, intervalMs)
      : undefined;
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs, enabled]);
}
