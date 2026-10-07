/** URL de l'API (source unique pour le nouveau code). */
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const authHeaders = (token: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

/** Montant formaté dans la langue active (FCFA par défaut). */
export const formatMoney = (amount: number, lang: string, currency = 'XOF') => {
  const value = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(amount || 0);
  return currency === 'XOF' ? `${value} FCFA` : `${value} ${currency}`;
};
