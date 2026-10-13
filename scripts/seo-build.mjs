/**
 * Étape SEO après `vite build` (application monopage) :
 *  1. Pré-rendu des métadonnées : une page HTML par page publique, projet publié et article publié,
 *     avec titre, description, image de partage, adresse canonique, données structurées (schema.org)
 *     et un résumé lisible sans JavaScript. Les robots des réseaux sociaux (WhatsApp, Facebook,
 *     LinkedIn, X), qui n'exécutent pas le JavaScript, obtiennent ainsi un aperçu correct.
 *  2. Plan du site dynamique (projets et articles), récupéré auprès de l'API.
 *
 * Variables : VITE_API_URL (API, facultative : sans elle, seules les pages fixes sont pré-rendues),
 *             VITE_SITE_URL (domaine public, par défaut https://frontend-emeraude.vercel.app).
 * Le build n'échoue jamais à cause de cette étape.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const SITE = (process.env.VITE_SITE_URL || 'https://frontend-emeraude.vercel.app').replace(/\/$/, '');
const API = process.env.VITE_API_URL?.replace(/\/$/, '');
const SITE_NAME = 'Emeraude Africa';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

const fr = JSON.parse(await readFile(new URL('src/locales/fr/translation.json', root), 'utf8'));
const template = await readFile(new URL('index.html', dist), 'utf8');
// Copie vierge de l'application pour toutes les adresses non pré-rendues (espace client, admin…) :
// cible de la réécriture « /app » de vercel.json. Écrite en premier, avant toute autre étape.
await writeFile(new URL('app.html', dist), template, 'utf8');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const plain = (v, max = 160) => {
  const text = String(v ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};
// Variables des textes ({{minTicket}}…) : valeurs de l'API si disponible, sinon valeurs par défaut du registre.
const vars = { minTicket: '100 000 FCFA' };
const fill = (text) => (typeof text === 'string' ? text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m) : text);
const get = (path) => fill(path.split('.').reduce((o, k) => o?.[k], fr));

/** Pages publiques fixes : [chemin, clé du titre, clé de la description]. */
const STATIC_PAGES = [
  ['/', null, 'home.subtitle'],
  ['/investir', 'invest.title', 'invest.subtitle'],
  ['/pourquoi-emeraude', 'why.title', 'why.subtitle'],
  ['/financer', 'finance.title', 'finance.subtitle'],
  ['/comment-ca-marche', 'howItWorks.title', 'howItWorks.subtitle'],
  ['/actualites', 'blog.title', 'blog.subtitle'],
  ['/a-propos', 'about.title', 'about.subtitle'],
  ['/faq', 'faq.title', 'faq.subtitle'],
  ['/contact', 'contact.title', 'contact.subtitle'],
  ['/inscription', 'register.title', 'register.subtitle'],
  ['/mentions-legales', 'legalPages.notice.title', 'legalPages.notice.subtitle'],
  ['/cgu-cgv', 'legalPages.terms.title', 'legalPages.terms.subtitle'],
  ['/politique-confidentialite', 'legalPages.privacy.title', 'legalPages.privacy.subtitle'],
];

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  description: plain(get('home.subtitle'), 300),
};

function render({ path, title, description, image = DEFAULT_IMAGE, type = 'website', jsonLd }) {
  // Accueil : titre court (Google en affiche environ 60 caractères).
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Investissement immobilier participatif`;
  const desc = plain(description);
  const url = `${SITE}${path === '/' ? '/' : path}`;
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');

  let html = template
    // Balises par défaut du gabarit remplacées par celles de la page.
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta (name|property)="(description|og:title|og:description|og:url|og:image|og:type|twitter:title|twitter:description|twitter:image)"[^>]*>\s*/g, '')
    .replace(/<link rel="canonical"[^>]*>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`);
  // Résumé lisible sans JavaScript ; React le remplace au démarrage.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><main class="container" style="padding:4rem 1rem"><h1>${esc(title || SITE_NAME)}</h1><p>${esc(desc)}</p></main></div>`,
  );
  return html;
}

async function write(path, html) {
  const file = path === '/' ? new URL('index.html', dist) : new URL(`.${path}.html`, dist);
  await mkdir(dirname(fileURLToPath(file)), { recursive: true });
  await writeFile(file, html, 'utf8');
}

async function fetchJson(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${API}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`réponse ${res.status}`);
    return path.endsWith('.xml') ? await res.text() : await res.json();
  } finally {
    clearTimeout(timer);
  }
}

let count = 0;
if (API) {
  try {
    const stats = await fetchJson('/projects/stats/public');
    if (stats?.minTicket) vars.minTicket = `${new Intl.NumberFormat('fr-FR').format(stats.minTicket)} FCFA`.replace(/ /g, ' ');
  } catch {
    // Valeur par défaut conservée.
  }
}
try {
  for (const [path, titleKey, descKey] of STATIC_PAGES) {
    await write(path, render({
      path,
      title: titleKey ? get(titleKey) : null,
      description: get(descKey),
      jsonLd: path === '/' ? [ORGANIZATION, { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE }] : undefined,
    }));
    count++;
  }

  if (!API) {
    console.log(`[seo] ${count} pages fixes pré-rendues. VITE_API_URL absent : projets, articles et plan du site dynamique ignorés.`);
  } else {
    try {
      const [projects, posts, sitemap] = await Promise.all([fetchJson('/projects'), fetchJson('/posts'), fetchJson('/seo/sitemap.xml')]);
      for (const p of Array.isArray(projects) ? projects : []) {
        await write(`/projet/${p.id}`, render({ path: `/projet/${p.id}`, title: p.title, description: `${p.location} · ${p.description}`, image: p.image || DEFAULT_IMAGE }));
        count++;
      }
      for (const post of Array.isArray(posts) ? posts : []) {
        const path = `/actualites/${post.slug}`;
        await write(path, render({
          path,
          title: post.title,
          description: post.excerpt,
          image: post.coverImage || DEFAULT_IMAGE,
          type: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage || DEFAULT_IMAGE,
            datePublished: post.publishedAt,
            inLanguage: post.locale,
            publisher: ORGANIZATION,
            mainEntityOfPage: `${SITE}${path}`,
          },
        }));
        count++;
      }
      if (typeof sitemap === 'string' && sitemap.includes('<urlset')) {
        await writeFile(new URL('sitemap.xml', dist), sitemap, 'utf8');
      }
      console.log(`[seo] ${count} pages pré-rendues (dont projets et articles), plan du site dynamique écrit.`);
    } catch (error) {
      console.warn(`[seo] API injoignable (${error.message}) : ${count} pages fixes pré-rendues, plan du site statique conservé.`);
    }
  }
} catch (error) {
  console.warn(`[seo] Étape ignorée : ${error.message}`);
}
