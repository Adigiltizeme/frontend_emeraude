import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMinTicket } from '../hooks/useMinTicket';
import { API_URL } from '../config/api';
import ArticleContent from '../components/ArticleContent';

interface FaqItem { id: string; category: string; question: string; answer: string }

/** Ordre d'affichage des rubriques (libellés : faq.categories.<rubrique>). */
const CATEGORIES = ['general', 'investing', 'risks', 'payments', 'owners', 'account'];

/** FAQ éditée dans le back-office ; à défaut (API indisponible), questions de repli des fichiers de langue. */
const FAQ = () => {
  const { t, i18n } = useTranslation();
  const minTicket = useMinTicket();
  usePageMeta(t('faq.title'), t('faq.subtitle'));
  const locale = i18n.language.startsWith('en') ? 'en' : 'fr';
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/faq?locale=${locale}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { setItems(Array.isArray(data) ? data : []); setFailed(false); })
      .catch(() => { setItems([]); setFailed(true); });
  }, [locale]);

  const fallback: FaqItem[] = [1, 2, 3, 4].map((n) => ({ id: `q${n}`, category: 'general', question: t(`faq.q${n}`), answer: t(`faq.a${n}`) }));
  const list = items === null ? [] : failed ? fallback : items;
  // {{minTicket}} : ticket minimum en vigueur (jamais de montant écrit en dur dans les réponses).
  const answer = (text: string) => text.replace(/\{\{\s*minTicket\s*\}\}/g, minTicket);
  const groups = CATEGORIES.map((c) => ({ category: c, items: list.filter((i) => i.category === c) }))
    .concat([{ category: 'other', items: list.filter((i) => !CATEGORIES.includes(i.category)) }])
    .filter((g) => g.items.length);

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>{t('faq.title')}</h1>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '1rem' }}>{t('faq.subtitle')}</p>
      </div>

      {items === null && <p role="status" style={{ textAlign: 'center', color: 'var(--color-neutral-500)' }}>{t('common.loading')}</p>}
      {groups.map((group) => (
        <section key={group.category} aria-labelledby={`faq-${group.category}`} style={{ marginBottom: '2.5rem' }}>
          {groups.length > 1 && <h2 id={`faq-${group.category}`} style={{ fontSize: '1.3rem', color: 'var(--color-primary-900)', marginBottom: '1rem' }}>{t(`faq.categories.${group.category}`)}</h2>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {group.items.map((faq) => (
              <details key={faq.id} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-primary-600)' }}>
                <summary style={{ cursor: 'pointer', padding: '1.1rem 1.5rem', fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-primary-900)' }}>{faq.question}</summary>
                <div style={{ padding: '0 1.5rem 0.25rem', fontSize: '0.95rem' }}>
                  <ArticleContent content={answer(faq.answer)} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('faq.notFoundTitle')}</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-neutral-600)' }}>{t('faq.notFoundDesc')}</p>
        <a href="/contact" className="btn btn-outline">{t('faq.btnContact')}</a>
      </div>
    </div>
  );
};

export default FAQ;
