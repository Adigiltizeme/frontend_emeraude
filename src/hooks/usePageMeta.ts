import { useEffect } from 'react';

const SITE_NAME = 'Emeraude Africa';

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/** Titre, description et balises de partage (Open Graph / Twitter) propres à chaque page. */
export function usePageMeta(title?: string, description?: string, image?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;
    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);
    if (description) {
      const text = description.replace(/<[^>]*>/g, '').slice(0, 160);
      setMeta('name', 'description', text);
      setMeta('property', 'og:description', text);
      setMeta('name', 'twitter:description', text);
    }
    // Sans image propre à la page, retour à l'image de partage par défaut (pas celle de la page précédente).
    const shareImage = image || `${window.location.origin}/og-image.png`;
    setMeta('property', 'og:image', shareImage);
    setMeta('name', 'twitter:image', shareImage);
    const url = window.location.origin + window.location.pathname;
    setMeta('property', 'og:url', url);
    setCanonical(url);
  }, [title, description, image]);
}
