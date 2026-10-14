import { API_URL } from '../../config/api';

/** Réponses fictives des écrans parcourus par la visite (générées par backend_emeraude/scripts/tour-demo-capture.mjs). */
export type TourDemoData = Record<string, unknown> & { __routes: { dossier: string; distributions: string; owner: string } };

export const loadTourDemoData = async () => (await import('./tourDemoData.json')).default as unknown as TourDemoData;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Mode démonstration de la visite guidée : les requêtes authentifiées vers l'API reçoivent les données fictives
 * (lecture) ou un refus (toute modification). Aucune donnée réelle n'est lue avant le paiement ; le serveur refuse
 * de toute façon (BILLING_REQUIRED). Seules les routes du paiement passent. Renvoie la fonction qui rétablit fetch.
 */
export function startTourDemo(data: TourDemoData, identity: { id?: string; email?: string; firstName?: string; lastName?: string; role?: string }) {
  const previous = window.fetch;
  const api = new URL(API_URL, window.location.href);
  const basePath = api.pathname.replace(/\/$/, '');

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const path = url.pathname.slice(basePath.length) || '/';
    // Pages publiques (sans jeton) et paiement d'accès : données réelles.
    if (url.origin !== api.origin || !url.pathname.startsWith(basePath) || !headers.get('Authorization') || path.startsWith('/billing/')) {
      return previous(input, init);
    }
    if (method !== 'GET') return json({ message: 'DEMO: action désactivée pendant la visite.' }, 403);
    if (path === '/auth/me') return json({ ...(data['/auth/me'] as object), ...identity });
    return path in data ? json(data[path]) : json({ message: 'DEMO: aperçu indisponible.' }, 404);
  };

  return () => { window.fetch = previous; };
}
