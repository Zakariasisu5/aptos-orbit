import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: 'petra' | 'martian' | 'pontem' | null;
  balance: number;
  network: 'mainnet' | 'testnet';
}

interface WalletActions {
  connect: (walletType: 'petra' | 'martian' | 'pontem') => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'mainnet' | 'testnet') => void;
  updateBalance: (balance: number) => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      address: null,
      walletType: null,
      balance: 0,
      network: 'mainnet',

      // Actions
      connect: async (walletType) => {
        try {
          // Mock wallet connection
          const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
          
          set({
            isConnected: true,
            address: mockAddress,
            walletType,
            balance: Math.random() * 1000, // Mock balance
          });

          // In real app, would integrate with actual wallet adapters
          console.log(`Connected to ${walletType} wallet`);
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          throw error;
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          address: null,
          walletType: null,
          balance: 0,
        });
      },

      switchNetwork: (network) => {
        set({ network });
      },

      updateBalance: (balance) => {
        set({ balance });
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        walletType: state.walletType,
        network: state.network,
      }),
    }
  )
);