/**
 * Après `vite build` : remplace dist/sitemap.xml par le plan du site généré par l'API
 * (pages fixes + projets publiés + articles publiés).
 * Sans VITE_API_URL dans l'environnement ou si l'API ne répond pas, la version statique
 * de public/sitemap.xml est conservée : le build n'échoue jamais à cause de cette étape.
 */
import { writeFile } from 'node:fs/promises';

const api = process.env.VITE_API_URL;
const target = new URL('../dist/sitemap.xml', import.meta.url);

if (!api) {
  console.log('[sitemap] VITE_API_URL absent : plan du site statique conservé.');
  process.exit(0);
}

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  const res = await fetch(`${api.replace(/\/$/, '')}/seo/sitemap.xml`, { signal: controller.signal });
  clearTimeout(timer);
  const xml = await res.text();
  if (!res.ok || !xml.includes('<urlset')) throw new Error(`réponse ${res.status}`);
  await writeFile(target, xml, 'utf8');
  console.log(`[sitemap] Plan du site dynamique écrit (${(xml.match(/<url>/g) || []).length} adresses).`);
} catch (error) {
  console.warn(`[sitemap] API injoignable (${error.message}) : plan du site statique conservé.`);
}
