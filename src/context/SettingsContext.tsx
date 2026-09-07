import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  contactEmail: 'contact@emeraude-africa.com',
  contactPhone: '+33 6 12 34 56 78',
  contactAddress: '123 Avenue des Champs-Elysées, 75008 Paris'
};

const SettingsContext = createContext<SettingsContextType>({ settings: defaultSettings, loading: true });

export const useSiteSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings({
            contactEmail: data.contactEmail || defaultSettings.contactEmail,
            contactPhone: data.contactPhone || defaultSettings.contactPhone,
            contactAddress: data.contactAddress || defaultSettings.contactAddress
          });
        }
      } catch (err) {
        console.error('Failed to fetch site settings', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
