import { API_URL, authHeaders } from '../config/api';
import type { ProjectDocuments } from '../components/ProjectForm';

/**
 * Téléverse les documents d'un projet (brochure, documentation légale) après sa création ou sa modification.
 * Renvoie la liste des documents qui n'ont pas pu être envoyés (vide si tout est passé).
 */
export async function uploadProjectDocuments(projectId: string, token: string | null, documents?: ProjectDocuments) {
  const failed: string[] = [];
  if (!documents) return failed;
  for (const kind of ['brochure', 'legal'] as const) {
    const file = documents[kind];
    if (!file) continue;
    const body = new FormData();
    body.append('file', file);
    const res = await fetch(`${API_URL}/projects/${projectId}/documents/${kind}`, { method: 'POST', headers: authHeaders(token), body });
    if (!res.ok) failed.push(kind);
  }
  // Galerie : 6 photos par envoi au maximum (limite de l'API).
  const photos = documents.gallery ?? [];
  for (let i = 0; i < photos.length; i += 6) {
    const body = new FormData();
    photos.slice(i, i + 6).forEach((file) => body.append('files', file));
    const res = await fetch(`${API_URL}/projects/${projectId}/gallery`, { method: 'POST', headers: authHeaders(token), body });
    if (!res.ok) failed.push('gallery');
  }
  return failed;
}
