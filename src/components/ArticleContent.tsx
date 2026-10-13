/**
 * Affiche le contenu texte d'un article, sans jamais interpréter de HTML (aucun risque d'injection de script).
 * Conventions : paragraphes séparés par une ligne vide ; « ## » en début de ligne = intertitre ; « - » = liste.
 */
const ArticleContent = ({ content }: { content: string }) => {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-neutral-800)' }}>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return <h2 key={i} style={{ fontSize: '1.4rem', margin: '2rem 0 0.75rem', color: 'var(--color-primary-900)' }}>{block.slice(3)}</h2>;
        }
        const lines = block.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} style={{ margin: '0 0 1.25rem', paddingLeft: '1.5rem' }}>
              {lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: '0 0 1.25rem' }}>
            {lines.map((l, j) => (
              <span key={j}>{j > 0 && <br />}{l}</span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default ArticleContent;
