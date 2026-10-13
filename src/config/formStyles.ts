import type { CSSProperties } from 'react';

/**
 * Style des champs de formulaire : référence unique, reprise des formulaires d'origine (inscription, profil).
 * Bordure visible, coins arrondis, fond légèrement teinté ; l'état « focus » est géré par la classe `.form-control` (index.css).
 */
export const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

/** Variante compacte (filtres, barres d'outils, réglages en ligne). */
export const compactFieldStyle: CSSProperties = { ...fieldStyle, padding: '0.6rem 0.8rem', fontSize: '0.95rem' };

export const labelStyle: CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569' };
