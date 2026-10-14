import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../config/api';
import type { PortfolioTransaction } from '../../hooks/usePortfolio';

const PAGE = 15;
/** Sens de l'opération pour l'investisseur : sortie d'argent (investissement, paiement) ou entrée (revenus, remboursements). */
const INFLOW = new Set(['INCOME', 'CAPITAL', 'REFUND']);

/** Historique des opérations : investissements, paiements, remboursements, revenus et capital reçus. */
const TransactionHistory = ({ transactions }: { transactions: PortfolioTransaction[] }) => {
  const { t, i18n } = useTranslation();
  const [shown, setShown] = useState(PAGE);
  if (!transactions.length) return null;
  const cell = { padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-neutral-100)', fontSize: '0.9rem' } as const;

  return (
    <section aria-labelledby="history-title" style={{ marginTop: '2rem' }}>
      <h3 id="history-title" style={{ margin: '0 0 0.75rem', color: 'var(--color-neutral-800)', fontSize: '1.25rem' }}>{t('portfolio.history')}</h3>
      <div style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)', borderRadius: '8px', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 560 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['date', 'operation', 'project', 'amount'].map((c) => (
                <th key={c} scope="col" style={{ ...cell, fontWeight: 600, color: '#475569', textAlign: c === 'amount' ? 'right' : 'left' }}>{t(`portfolio.columns.${c}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, shown).map((tr, i) => (
              <tr key={`${tr.kind}-${tr.date}-${i}`}>
                <td style={cell}>{new Date(tr.date).toLocaleDateString(i18n.language)}</td>
                <td style={cell}>
                  {t(`portfolio.kinds.${tr.kind}`)}
                  {tr.kind === 'INVESTMENT' && tr.status && <span style={{ color: 'var(--color-neutral-500)' }}> · {t(`admin.status.${tr.status}`)}</span>}
                  {tr.reference && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{t('portfolio.reference', { ref: tr.reference })}</span>}
                </td>
                <td style={cell}>{tr.project}{tr.period ? ` (${tr.period})` : ''}</td>
                <td style={{ ...cell, textAlign: 'right', fontWeight: 600, color: INFLOW.has(tr.kind) ? '#166534' : 'var(--color-neutral-800)', whiteSpace: 'nowrap' }}>
                  {INFLOW.has(tr.kind) ? '+ ' : ''}{formatMoney(tr.amount, i18n.language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length > shown && (
        <button type="button" className="btn btn-outline" style={{ marginTop: '0.75rem' }} onClick={() => setShown((n) => n + PAGE)}>
          {t('portfolio.showMore', { count: Math.min(PAGE, transactions.length - shown) })}
        </button>
      )}
    </section>
  );
};

export default TransactionHistory;
