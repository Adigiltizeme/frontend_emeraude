import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { API_URL } from '../config/api';
import { useSocket } from './SocketContext';

/** Paramètres publics de la plateforme (définis dans le registre de l'API : settings.registry.ts). */
export interface SiteSettings {
  siteAnnouncement: string;
  whatsappNumber: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialInstagram: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  legalIsDemo: boolean;
  legalCompanyName: string;
  legalForm: string;
  legalCapital: string;
  legalRegistration: string;
  legalAddress: string;
  legalDirector: string;
  legalRegulator: string;
  legalLicense: string;
  privacyEmail: string;
  investmentRequiresKyc: boolean;
  defaultMinTicket: number;
  maxInvestmentAmount: number;
  investorFeePercent: number;
  projectCommissionPercent: number;
  projectSubmissionFee: number;
  paymentExpiryHours: number;
  bankTransferEnabled: boolean;
  successThresholdPercent: number;
  requireEmailVerification: boolean;
  reflectionPeriodDays: number;
}

/** Chiffres publics calculés à partir des projets (ticket le plus accessible, collecte…). */
export interface PublicStats {
  minTicket: number;
  totalRaised: number;
  fundedProjects: number;
  investors: number;
}

/** Valeurs de repli tant que l'API n'a pas répondu (identiques aux valeurs par défaut du registre). */
const defaultSettings: SiteSettings = {
  siteAnnouncement: '',
  whatsappNumber: '',
  socialFacebook: '',
  socialLinkedin: '',
  socialInstagram: '',
  contactEmail: 'emeraudehabitatsenegal@gmail.com',
  contactPhone: '+221785435300',
  contactAddress: 'Chemin de la résidence Saint-James, La Somone Canda, Sénégal',
  legalIsDemo: true,
  legalCompanyName: 'Emeraude Africa',
  legalForm: 'Société Anonyme (SA)',
  legalCapital: '10 000 000 FCFA',
  legalRegistration: '',
  legalAddress: 'Dakar, Sénégal',
  legalDirector: 'Abdarrahman Samassa',
  legalRegulator: '',
  legalLicense: '',
  privacyEmail: 'privacy@emeraude-africa.com',
  investmentRequiresKyc: true,
  defaultMinTicket: 100000,
  maxInvestmentAmount: 0,
  investorFeePercent: 0,
  projectCommissionPercent: 0,
  projectSubmissionFee: 0,
  paymentExpiryHours: 24,
  bankTransferEnabled: true,
  successThresholdPercent: 100,
  requireEmailVerification: true,
  reflectionPeriodDays: 4,
};

interface SettingsContextType {
  settings: SiteSettings;
  stats: PublicStats | null;
  loading: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextType>({ settings: defaultSettings, stats: null, loading: true, refresh: () => {} });

export const useSiteSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const refresh = useCallback(() => {
    Promise.all([
      fetch(`${API_URL}/settings`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_URL}/projects/stats/public`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([values, publicStats]) => {
      if (values) setSettings({ ...defaultSettings, ...values });
      if (publicStats) setStats(publicStats);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Un administrateur modifie un paramètre public : toutes les pages ouvertes se mettent à jour.
  useEffect(() => {
    if (!socket) return;
    socket.on('settings.updated', refresh);
    return () => { socket.off('settings.updated', refresh); };
  }, [socket, refresh]);

  return (
    <SettingsContext.Provider value={{ settings, stats, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};
