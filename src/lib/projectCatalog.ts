/** Filtrage et tri du catalogue de projets (logique pure, sans React). */

export interface CatalogProject {
  id: string;
  title: string;
  location: string;
  target: number;
  raised?: number;
  returnRate: number;
  duration: number;
  minTicket: number;
  riskLevel: string;
  assetType: string;
  status: string;
  createdAt?: string;
}

export const SORTS = ['recent', 'return', 'ticket', 'progress', 'duration'] as const;
export type Sort = (typeof SORTS)[number];

export interface CatalogFilters {
  q: string;
  country: string;
  type: string;
  risk: string;
  status: '' | 'open' | 'closed';
  minReturn: string;
  maxDuration: string;
  maxTicket: string;
  sort: Sort;
}

export const EMPTY_FILTERS: CatalogFilters = {
  q: '', country: '', type: '', risk: '', status: '', minReturn: '', maxDuration: '', maxTicket: '', sort: 'recent',
};

/** Comparaison insensible à la casse et aux accents (« senegal » trouve « Sénégal »). */
export const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Pays = dernière partie du lieu (« Somone, Sénégal » → « Sénégal »). */
export const countryOf = (location: string) => {
  const parts = (location || '').split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
};

export const progressOf = (p: CatalogProject) => (p.target > 0 ? Math.min(100, ((p.raised || 0) / p.target) * 100) : 0);

/** Valeurs distinctes présentes dans le catalogue, triées (alimentent les listes de choix). */
export function distinctValues(projects: CatalogProject[], pick: (p: CatalogProject) => string, locale: string) {
  const byKey = new Map<string, string>();
  for (const p of projects) {
    const value = pick(p)?.trim();
    if (value && !byKey.has(normalize(value))) byKey.set(normalize(value), value);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, locale));
}

const toNumber = (value: string) => {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return value !== '' && Number.isFinite(n) ? n : null;
};

export function filterProjects(projects: CatalogProject[], f: CatalogFilters): CatalogProject[] {
  const q = normalize(f.q);
  const minReturn = toNumber(f.minReturn);
  const maxDuration = toNumber(f.maxDuration);
  const maxTicket = toNumber(f.maxTicket);

  const result = projects.filter((p) => {
    if (q && !normalize(`${p.title} ${p.location}`).includes(q)) return false;
    if (f.country && normalize(countryOf(p.location)) !== normalize(f.country)) return false;
    if (f.type && normalize(p.assetType) !== normalize(f.type)) return false;
    if (f.risk && normalize(p.riskLevel) !== normalize(f.risk)) return false;
    if (f.status === 'open' && p.status !== 'COLLECTING') return false;
    if (f.status === 'closed' && p.status === 'COLLECTING') return false;
    if (minReturn !== null && p.returnRate < minReturn) return false;
    if (maxDuration !== null && p.duration > maxDuration) return false;
    if (maxTicket !== null && p.minTicket > maxTicket) return false;
    return true;
  });

  const time = (p: CatalogProject) => (p.createdAt ? new Date(p.createdAt).getTime() : 0);
  const sorters: Record<Sort, (a: CatalogProject, b: CatalogProject) => number> = {
    recent: (a, b) => time(b) - time(a),
    return: (a, b) => b.returnRate - a.returnRate,
    ticket: (a, b) => a.minTicket - b.minTicket,
    progress: (a, b) => progressOf(b) - progressOf(a),
    duration: (a, b) => a.duration - b.duration,
  };
  // Les projets ouverts à la collecte restent en tête, quel que soit le tri choisi.
  const open = (p: CatalogProject) => (p.status === 'COLLECTING' ? 0 : 1);
  return result.sort((a, b) => open(a) - open(b) || sorters[f.sort](a, b));
}

/** Lecture des filtres depuis l'adresse de la page (recherche partageable). */
export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const sort = params.get('tri') as Sort;
  const status = params.get('statut');
  return {
    q: params.get('q') || '',
    country: params.get('pays') || '',
    type: params.get('type') || '',
    risk: params.get('risque') || '',
    status: status === 'open' || status === 'closed' ? status : '',
    minReturn: params.get('rendement') || '',
    maxDuration: params.get('duree') || '',
    maxTicket: params.get('ticket') || '',
    sort: SORTS.includes(sort) ? sort : 'recent',
  };
}

export function filtersToParams(f: CatalogFilters): URLSearchParams {
  const entries: [string, string][] = [
    ['q', f.q.trim()], ['pays', f.country], ['type', f.type], ['risque', f.risk], ['statut', f.status],
    ['rendement', f.minReturn], ['duree', f.maxDuration], ['ticket', f.maxTicket], ['tri', f.sort === 'recent' ? '' : f.sort],
  ];
  return new URLSearchParams(entries.filter(([, v]) => v));
}

/** Nombre de filtres actifs (hors tri), affiché sur le bouton mobile. */
export const activeFilterCount = (f: CatalogFilters) =>
  [f.q, f.country, f.type, f.risk, f.status, f.minReturn, f.maxDuration, f.maxTicket].filter(Boolean).length;
