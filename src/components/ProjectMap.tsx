import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface ProjectMapProps {
  location: string;
}

const ProjectMap: React.FC<ProjectMapProps> = ({ location }) => {
  const [viewport, setViewport] = useState({
    longitude: -17.4467, // Dakar par défaut
    latitude: 14.6928,
    zoom: 12
  });

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const [error, setError] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{longitude: number, latitude: number} | null>(null);


  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError('Jeton Mapbox manquant (VITE_MAPBOX_TOKEN). La carte utilise les coordonnées par défaut de Dakar.');
      return;
    }

    // Appel à l'API de géocodage Mapbox pour trouver les coordonnées à partir du nom
    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setViewport({
            longitude: lng,
            latitude: lat,
            zoom: 13
          });
          setLocationCoords({ longitude: lng, latitude: lat });
          setError(null);
        } else {
          setError('Emplacement introuvable sur la carte.');
        }
      } catch (err) {
        console.error('Erreur lors du géocodage:', err);
        setError('Erreur de chargement de la carte.');
      }
    };

    fetchCoordinates();
  }, [location, MAPBOX_TOKEN]);

  return (
    <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', border: '1px solid var(--color-neutral-200)' }}>
      {MAPBOX_TOKEN ? (
        <Map
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="bottom-right" />
          {locationCoords && (
          <Marker longitude={locationCoords.longitude} latitude={locationCoords.latitude} anchor="bottom">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-primary-600)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                {location}
              </div>
              <MapPin size={32} color="var(--color-primary-600)" fill="white" />
            </div>
          </Marker>
          )}
        </Map>
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
          <MapPin size={48} color="var(--color-neutral-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>Carte indisponible</h3>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectMap;