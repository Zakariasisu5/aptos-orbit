import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultCurrency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    transactionAlerts: boolean;
    priceAlerts: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    autoLockTimeout: number; // minutes
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReportsEnabled: boolean;
    marketDataSharing: boolean;
  };
  display: {
    compactMode: boolean;
    showBalances: boolean;
    animationsEnabled: boolean;
  };
}

interface SettingsActions {
  updateCurrency: (currency: string) => void;
  updateLanguage: (language: string) => void;
  updateNotifications: (notifications: Partial<SettingsState['notifications']>) => void;
  updateSecurity: (security: Partial<SettingsState['security']>) => void;
  updatePrivacy: (privacy: Partial<SettingsState['privacy']>) => void;
  updateDisplay: (display: Partial<SettingsState['display']>) => void;
  resetToDefaults: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: SettingsState = {
  defaultCurrency: 'USDC',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    transactionAlerts: true,
    priceAlerts: false,
    marketingEmails: false,
  },
  security: {
    twoFactorEnabled: false,
    biometricEnabled: false,
    autoLockTimeout: 15,
  },
  privacy: {
    analyticsEnabled: true,
    crashReportsEnabled: true,
    marketDataSharing: false,
  },
  display: {
    compactMode: false,
    showBalances: true,
    animationsEnabled: true,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateCurrency: (currency) => {
        set({ defaultCurrency: currency });
      },

      updateLanguage: (language) => {
        set({ language });
      },

      updateNotifications: (notifications) => {
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        }));
      },

      updateSecurity: (security) => {
        set((state) => ({
          security: { ...state.security, ...security },
        }));
      },

      updatePrivacy: (privacy) => {
        set((state) => ({
          privacy: { ...state.privacy, ...privacy },
        }));
      },

      updateDisplay: (display) => {
        set((state) => ({
          display: { ...state.display, ...display },
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);