import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light';
export type DashboardDensity = 'comfortable' | 'compact';

export interface AppSettings {
  // SECTION A: Appearance
  theme: AppTheme;
  density: DashboardDensity;
  animationsEnabled: boolean;
  chartAnimationsEnabled: boolean;

  // SECTION B: Notifications
  notifyCritical: boolean;
  notifyHigh: boolean;
  notifyAnomalies: boolean;
  notifyIncidents: boolean;
  notifySimulation: boolean;

  // SECTION C: Dashboard Preferences
  showNetworkHealth: boolean;
  showLiveThreatFeed: boolean;
  showTrafficChart: boolean;
  showThreatDistribution: boolean;
  showRiskStatistics: boolean;
  showRecentIncidents: boolean;

  // SECTION D: Security Display Preferences
  showIpAddresses: boolean;
  showRiskScore: boolean;
  showAiConfidence: boolean;
  showThreatExplanations: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  density: 'comfortable',
  animationsEnabled: true,
  chartAnimationsEnabled: true,

  notifyCritical: true,
  notifyHigh: true,
  notifyAnomalies: true,
  notifyIncidents: true,
  notifySimulation: false,

  showNetworkHealth: true,
  showLiveThreatFeed: true,
  showTrafficChart: true,
  showThreatDistribution: true,
  showRiskStatistics: true,
  showRecentIncidents: true,

  showIpAddresses: true,
  showRiskScore: true,
  showAiConfidence: true,
  showThreatExplanations: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

const SETTINGS_STORAGE_KEY = 'ipthreat_settings_v1';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const explicitTheme = localStorage.getItem('ipthreat_theme') as AppTheme | null;
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedTheme: AppTheme =
          explicitTheme === 'light' || explicitTheme === 'dark'
            ? explicitTheme
            : (parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'dark');
        return { ...DEFAULT_SETTINGS, ...parsed, theme: resolvedTheme };
      } else if (explicitTheme === 'light' || explicitTheme === 'dark') {
        return { ...DEFAULT_SETTINGS, theme: explicitTheme };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_SETTINGS;
  });

  // Synchronize Theme on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('ipthreat_theme', settings.theme);
    } catch {
      // ignore
    }
  }, [settings.theme]);

  // Persist settings changes
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage failure
    }
  }, [settings]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.setItem('ipthreat_theme', 'dark');
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme: AppTheme = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        toggleTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
