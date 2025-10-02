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
          let provider: any = null;
          let address: string | null = null;

          if (typeof window === 'undefined') {
            throw new Error('Window not available');
          }

          // Get the appropriate wallet provider
          switch (walletType) {
            case 'petra':
              provider = (window as any).aptos;
              if (provider) {
                // Petra-specific connection
                const response = await provider.connect();
                address = response?.address;
              }
              break;
            case 'martian':
              provider = (window as any).martian;
              if (provider) {
                const response = await provider.connect();
                address = response?.address || response?.account?.address;
              }
              break;
            case 'pontem':
              provider = (window as any).pontem;
              if (provider) {
                const response = await provider.connect();
                address = response?.address || response?.account?.address;
              }
              break;
          }

          if (!provider) {
            throw new Error(`${walletType} wallet not found`);
          }

          if (!address) {
            throw new Error('Failed to get wallet address');
          }

          set({
            isConnected: true,
            address,
            walletType,
            balance: 0, // Will be updated by useBalances hook
          });

          console.log(`✅ Connected to ${walletType} wallet: ${address}`);
        } catch (error) {
          console.error('❌ Failed to connect wallet:', error);
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