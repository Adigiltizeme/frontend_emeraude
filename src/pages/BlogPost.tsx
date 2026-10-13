import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../config/api';
import { usePageMeta } from '../hooks/usePageMeta';
import ArticleContent from '../components/ArticleContent';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
  author: { firstName: string | null; lastName: string | null } | null;
}

const BlogPost = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notFound'>('loading');
  usePageMeta(post?.title || t('blog.title'), post?.excerpt, post?.coverImage || undefined);

  useEffect(() => {
    if (!slug) return;
    setState('loading');
    fetch(`${API_URL}/posts/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) return setState('notFound');
        setPost(await res.json());
        setState('ready');
        window.scrollTo(0, 0);
      })
      .catch(() => setState('notFound'));
  }, [slug]);

  const back = (
    <Link to="/actualites" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-600)', textDecoration: 'none', fontWeight: 500, marginBottom: '2rem' }}>
      <ArrowLeft size={18} /> {t('blog.back')}
    </Link>
  );

  if (state !== 'ready' || !post) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '760px', minHeight: '60vh' }}>
        {back}
        <p style={{ color: 'var(--color-neutral-600)' }}>{state === 'loading' ? t('blog.loading') : t('blog.notFound')}</p>
      </div>
    );
  }

  const author = [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ');
  const date = new Date(post.publishedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article className="container" style={{ padding: '4rem 1rem', maxWidth: '760px' }}>
      {back}
      <h1 style={{ color: 'var(--color-primary-900)', lineHeight: 1.25, marginBottom: '0.75rem' }}>{post.title}</h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: '2rem' }}>
        <time dateTime={post.publishedAt}>{t('blog.publishedOn', { date })}</time>
        {author && <> · {t('blog.by', { author })}</>}
      </p>
      {post.coverImage && (
        <img src={post.coverImage} alt="" style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
      )}
      <ArticleContent content={post.content} />
    </article>
  );
};

export default BlogPost;
