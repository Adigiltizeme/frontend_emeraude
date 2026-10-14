import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin } from 'lucide-react';

// Carte interactive (Mapbox, ~1,9 Mo) chargée seulement si le visiteur la demande.
const ProjectMap = lazy(() => import('./ProjectMap'));

/** Localisation d'un projet : lien léger vers OpenStreetMap, carte interactive à la demande. */
const MapOnDemand = ({ location }: { location: string }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const osm = `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;

  if (show) {
    return (
      <Suspense fallback={<p style={{ color: 'var(--color-neutral-500)', padding: '1rem 0' }}>{t('map.loading')}</p>}>
        <ProjectMap location={location} />
      </Suspense>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem', marginTop: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', backgroundColor: 'white' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-700)' }}>
        <MapPin size={20} color="var(--color-primary-600)" aria-hidden="true" /> {location}
      </span>
      <span style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-outline" onClick={() => setShow(true)} style={{ padding: '0.45rem 0.9rem' }}>{t('map.show')}</button>
        <a href={osm} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          {t('map.openExternal')} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </span>
    </div>
  );
};

export default MapOnDemand;
