import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';
import { usePageMeta } from '../hooks/usePageMeta';
import { optimizedImage } from '../lib/images';

interface PostSummary {
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string;
}

const currentLocale = (lang?: string) => (lang?.startsWith('en') ? 'en' : 'fr');

/** Liste des actualités publiées, dans la langue active (repli sur les autres langues si aucune). */
const Blog = () => {
  const { t, i18n } = useTranslation();
  usePageMeta(t('blog.title'), t('blog.subtitle'));
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [otherLanguage, setOtherLanguage] = useState(false);
  const [loading, setLoading] = useState(true);
  const locale = currentLocale(i18n.language);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const own: PostSummary[] = await fetch(`${API_URL}/posts?locale=${locale}`).then((r) => (r.ok ? r.json() : []));
        if (own.length || cancelled) {
          if (!cancelled) { setPosts(own); setOtherLanguage(false); }
          return;
        }
        const all: PostSummary[] = await fetch(`${API_URL}/posts`).then((r) => (r.ok ? r.json() : []));
        if (!cancelled) { setPosts(all); setOtherLanguage(all.length > 0); }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [locale]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1100px', minHeight: '70vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--color-primary-900)' }}>{t('blog.title')}</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-neutral-600)', maxWidth: '640px', margin: '1rem auto 0' }}>{t('blog.subtitle')}</p>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)' }}>{t('blog.loading')}</p>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)' }}>{t('blog.empty')}</p>
      ) : (
        <>
          {otherLanguage && <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', marginBottom: '2rem' }}>{t('blog.otherLanguage')}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
            {posts.map((post) => (
              <article key={post.slug} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' }}>
                {post.coverImage && (
                  <img src={optimizedImage(post.coverImage, 640)} alt="" loading="lazy" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <time dateTime={post.publishedAt} style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)' }}>{formatDate(post.publishedAt)}</time>
                  <h2 style={{ fontSize: '1.25rem', margin: '0.5rem 0 0.75rem', color: 'var(--color-primary-900)' }}>
                    <Link to={`/actualites/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
                  </h2>
                  <p style={{ color: 'var(--color-neutral-600)', lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>
                  <Link to={`/actualites/${post.slug}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600, marginTop: '1rem' }}>{t('blog.readMore')} →</Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Blog;
