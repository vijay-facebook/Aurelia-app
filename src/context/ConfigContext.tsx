import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteConfig } from '../config/types';
import { defaultConfig } from '../config/defaultConfig';

interface ConfigContextType {
  config: SiteConfig;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  updateConfig: (newConfig: SiteConfig) => Promise<boolean>;
  resetConfig: () => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType>({
  config: defaultConfig,
  loading: true,
  error: null,
  refreshConfig: async () => {},
  updateConfig: async () => false,
  resetConfig: async () => false,
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const salon = params.get('salon');
      const url = salon ? `/api/config?salon=${salon}` : '/api/config';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load configuration');
      const data = await res.json();
      if (data && typeof data === 'object') {
        setConfig(data);
      }
      setError(null);
    } catch (err: any) {
      console.warn('Using default config due to error:', err);
      setError(err?.message || 'Error loading config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: SiteConfig): Promise<boolean> => {
    try {
      const salon = newConfig.brand?.customSlug;
      const url = salon ? `/api/config?salon=${salon}` : '/api/config';
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save configuration');
      }
      const data = await res.json();
      setConfig(data);
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to update config');
      return false;
    }
  };

  const resetConfig = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/config/reset', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reset configuration');
      const data = await res.json();
      setConfig(data);
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to reset config');
      return false;
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, error, refreshConfig: fetchConfig, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
