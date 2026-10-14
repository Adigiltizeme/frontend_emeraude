import { API_URL, authHeaders } from '../config/api';

/** Télécharge un fichier protégé (export CSV) avec le jeton de session ; renvoie un message d'erreur ou null. */
export async function downloadProtected(path: string, token: string | null, fallbackName: string): Promise<string | null> {
  const res = await fetch(`${API_URL}${path}`, { headers: authHeaders(token) }).catch(() => null);
  if (!res) return 'network';
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return String(data?.message || res.status).replace(/^PERMISSION_DENIED: /, '');
  }
  const truncated = res.headers.get('X-Export-Truncated') === '1';
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  // Fichier téléchargé mais limité à 10 000 lignes : l'écran invite à réduire la période.
  return truncated ? 'TRUNCATED' : null;
}
