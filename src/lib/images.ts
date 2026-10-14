/**
 * Image Cloudinary allégée : format moderne et qualité automatiques, largeur limitée à l'affichage
 * (une photo de 4 Mo devient quelques dizaines de Ko). Les autres URL sont renvoyées telles quelles.
 */
export function optimizedImage(url: string | null | undefined, width: number): string {
  if (!url) return '';
  const marker = '/image/upload/';
  const index = url.indexOf(marker);
  if (!url.includes('res.cloudinary.com') || index < 0) return url;
  const rest = url.slice(index + marker.length);
  // Transformation déjà présente (segment avec virgules ou paramètres f_/q_/w_) : on ne la double pas.
  if (/^[a-z]_[^/]*\//.test(rest)) return url;
  return `${url.slice(0, index + marker.length)}f_auto,q_auto,c_limit,w_${Math.round(width)}/${rest}`;
}
