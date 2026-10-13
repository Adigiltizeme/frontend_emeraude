import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../context/SettingsContext';
import { formatMoney } from '../config/api';

/**
 * Montant « dès X FCFA » affiché sur le site : ticket le plus accessible parmi les projets ouverts,
 * sinon ticket minimum par défaut configuré dans le back-office. Jamais de montant écrit en dur.
 */
export function useMinTicket() {
  const { i18n } = useTranslation();
  const { settings, stats } = useSiteSettings();
  return formatMoney(stats?.minTicket ?? settings.defaultMinTicket, i18n.language);
}
