import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLiveRefresh } from '../hooks/useLiveRefresh';
import { API_URL, formatMoney } from '../config/api';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  CatalogFilters, CatalogProject, EMPTY_FILTERS, SORTS, activeFilterCount, countryOf, distinctValues,
  filterProjects, filtersFromParams, filtersToParams, progressOf,
} from '../lib/projectCatalog';

const SORT_LABELS: Record<string, string> = {
  recent: 'invest.filters.sortRecent',
  return: 'invest.filters.sortReturn',
  ticket: 'invest.filters.sortTicket',
  progress: 'invest.filters.sortProgress',
  duration: 'invest.filters.sortDuration',
};

const Invest = () => {
  const { t, i18n } = useTranslation();
  usePageMeta(t('invest.title'), t('invest.subtitle'));
  const [projects, setProjects] = useState<CatalogProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  const { socket } = useSocket();

  // L'API ne renvoie que les projets publiés (en collecte, financés, terminés).
  const fetchProjects = useCallback(() => {
    fetch(`${API_URL}/projects`)
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erreur lors de la récupération des projets", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Jauges à jour en temps réel, et au retour sur l'onglet.
  useEffect(() => {
    if (!socket) return;
    const onProjectUpdated = (data: any) => {
      setProjects(prev => prev.map(p => (p.id === data.projectId ? { ...p, raised: data.raised, status: data.status } : p)));
    };
    socket.on('project.updated', onProjectUpdated);
    return () => { socket.off('project.updated', onProjectUpdated); };
  }, [socket]);
  useLiveRefresh(fetchProjects);

  // Choix proposés : uniquement les valeurs présentes dans le catalogue.
  const options = useMemo(() => ({
    countries: distinctValues(projects, p => countryOf(p.location), i18n.language),
    types: distinctValues(projects, p => p.assetType, i18n.language),
    risks: distinctValues(projects, p => p.riskLevel, i18n.language),
  }), [projects, i18n.language]);

  const visible = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const activeCount = activeFilterCount(filters);

  const update = (patch: Partial<CatalogFilters>) => {
    setSearchParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  };
  const reset = () => setSearchParams(filtersToParams({ ...EMPTY_FILTERS, sort: filters.sort }), { replace: true });

  const money = (amount: number) => formatMoney(amount, i18n.language);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#475569' }}>{t('invest.loading')}</div>;
  }

  const field = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', backgroundColor: 'white', fontSize: '0.9rem' };
  const label = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.35rem' } as const;

  const select = (id: string, text: string, value: string, values: string[], onChange: (v: string) => void) => (
    <div>
      <label htmlFor={id} style={label}>{text}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} style={field}>
        <option value="">{t('invest.filters.any')}</option>
        {values.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  );

  const numberInput = (id: string, text: string, value: string, onChange: (v: string) => void, step = 1) => (
    <div>
      <label htmlFor={id} style={label}>{text}</label>
      <input id={id} type="number" inputMode="decimal" min={0} step={step} value={value} onChange={e => onChange(e.target.value)} style={field} />
    </div>
  );

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1>{t('invest.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', maxWidth: '600px', margin: '1rem auto 0' }}>
          {t('invest.subtitle')}
        </p>
      </div>

      {projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)' }}>{t('invest.filters.noProjects')}</p>
      ) : (
        <>
          {/* Barre principale : recherche, tri, accès aux filtres */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div style={{ flex: '1 1 260px' }}>
              <label htmlFor="catalog-search" style={label}>{t('invest.filters.search')}</label>
              <input id="catalog-search" type="search" value={filters.q} onChange={e => update({ q: e.target.value })} placeholder={t('invest.filters.searchPlaceholder')} style={field} />
            </div>
            <div style={{ flex: '0 1 240px' }}>
              <label htmlFor="catalog-sort" style={label}>{t('invest.filters.sort')}</label>
              <select id="catalog-sort" value={filters.sort} onChange={e => update({ sort: e.target.value as CatalogFilters['sort'] })} style={field}>
                {SORTS.map(s => <option key={s} value={s}>{t(SORT_LABELS[s])}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters} aria-controls="catalog-filters" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
              <SlidersHorizontal size={18} />
              {t('invest.filters.toggle')}{activeCount > 0 ? ` (${activeCount})` : ''}
            </button>
          </div>

          {showFilters && (
            <div id="catalog-filters" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
              {select('catalog-country', t('invest.filters.country'), filters.country, options.countries, v => update({ country: v }))}
              {select('catalog-type', t('invest.filters.type'), filters.type, options.types, v => update({ type: v }))}
              {select('catalog-risk', t('invest.filters.risk'), filters.risk, options.risks, v => update({ risk: v }))}
              <div>
                <label htmlFor="catalog-status" style={label}>{t('invest.filters.status')}</label>
                <select id="catalog-status" value={filters.status} onChange={e => update({ status: e.target.value as CatalogFilters['status'] })} style={field}>
                  <option value="">{t('invest.filters.any')}</option>
                  <option value="open">{t('invest.filters.statusOpen')}</option>
                  <option value="closed">{t('invest.filters.statusClosed')}</option>
                </select>
              </div>
              {numberInput('catalog-return', t('invest.filters.minReturn'), filters.minReturn, v => update({ minReturn: v }), 0.5)}
              {numberInput('catalog-duration', t('invest.filters.maxDuration'), filters.maxDuration, v => update({ maxDuration: v }))}
              {numberInput('catalog-ticket', t('invest.filters.maxTicket'), filters.maxTicket, v => update({ maxTicket: v }), 5000)}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <p role="status" aria-live="polite" style={{ margin: 0, color: 'var(--color-neutral-600)', fontWeight: 600 }}>
              {t('invest.filters.results', { count: visible.length })}
            </p>
            {activeCount > 0 && (
              <button type="button" onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontWeight: 600 }}>
                <X size={16} /> {t('invest.filters.reset')}
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', padding: '3rem 0' }}>{t('invest.filters.empty')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
              {visible.map(project => {
                const isClosed = project.status === 'FUNDED' || project.status === 'COMPLETED';
                const percent = Math.round(progressOf(project));
                return (
                  <div key={project.id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative' }} className="project-card">
                    <div className="project-card-image" style={{ height: '200px', backgroundImage: `url(${(project as any).image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease', filter: isClosed ? 'grayscale(100%) opacity(0.8)' : 'none' }}></div>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: project.status === 'COLLECTING' ? 'var(--color-primary-600)' : 'var(--color-neutral-800)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {t(`admin.status.${project.status}`)}
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: '0.5rem' }}>{project.location}</div>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{project.title}</h3>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ width: '100%', backgroundColor: 'var(--color-neutral-200)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, backgroundColor: 'var(--color-primary-500)', height: '100%' }} />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)', marginTop: '0.35rem' }}>{t('invest.progress', { percent })}</div>
                      </div>

                      {[
                        [t('invest.labelTarget'), money(project.target)],
                        [t('invest.labelMinTicket'), money(project.minTicket)],
                        [t('invest.labelReturn'), `${project.returnRate}%`],
                        [t('invest.labelDuration'), `${project.duration} ${t('invest.months')}`],
                      ].map(([name, value], i, rows) => (
                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === rows.length - 1 ? '1.5rem' : '0.5rem', paddingBottom: '0.5rem', borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--color-neutral-100)' }}>
                          <span style={{ color: 'var(--color-neutral-600)' }}>{name}</span>
                          <span style={{ fontWeight: 600, color: i === 2 ? 'var(--color-primary-600)' : undefined }}>{value}</span>
                        </div>
                      ))}

                      <Link to={`/projet/${project.id}`} className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                        {t('invest.btnDiscover')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invest;
