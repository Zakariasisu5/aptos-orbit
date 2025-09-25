import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Petra from '@/integrations/aptos/adapters/petra';
import * as Martian from '@/integrations/aptos/adapters/martian';
import * as Pontem from '@/integrations/aptos/adapters/pontem';

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
  // Optional adapter hook: sign and submit a transaction payload
  signAndSubmit?: (payload: any) => Promise<any>;
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
              // Allow 'auto' detection by passing walletType as any and checking availability
              let chosen: 'petra' | 'martian' | 'pontem' | null = walletType || null;

              // Prefer the Aptos Wallet Standard provider when present in the page
              const stdProvider = (globalThis as any).aptos || (globalThis as any).aptosProvider || null;

              if (!chosen && stdProvider) {
                // If a standard provider exists, try to infer which wallet by presence of vendor globals
                if ((globalThis as any).petra) chosen = 'petra';
                else if ((globalThis as any).martian) chosen = 'martian';
                else if ((globalThis as any).pontem) chosen = 'pontem';
                else chosen = 'petra'; // default to petra for UI labeling when unknown
              }

              if (!chosen) {
                if (Petra.isAvailable()) chosen = 'petra';
                else if (Martian.isAvailable()) chosen = 'martian';
                else if (Pontem.isAvailable()) chosen = 'pontem';
              }

              // If adapter available, use it; otherwise fall back to mocked connect
              let address = null;
              // First, attempt the Aptos Wallet Standard flow if present
              if ((globalThis as any).aptos) {
                try {
                  const std = (globalThis as any).aptos as any;
                  // Many standard providers expose a connect() that returns an object with address/account
                  const stdRes = await (std.connect ? std.connect() : std.request?.({ method: 'connect' }));
                  address = stdRes?.address || stdRes?.account || (std.account ? (await std.account())?.address : null) || null;
                } catch (stdErr) {
                  // swallow and fallback to vendor adapters below
                  console.debug('Standard wallet connect attempt failed, falling back to vendor adapters', { message: (stdErr as any)?.message });
                }
              }

              // If standard connect didn't populate address, fallback to vendor-specific adapters
              if (!address) {
                if (chosen === 'petra' && Petra.isAvailable()) {
                  const res = await Petra.connect();
                  // adapters return { raw, address }
                  address = res?.address || (res?.raw && res.raw.account) || null;
                } else if (chosen === 'martian' && Martian.isAvailable()) {
                  const res = await Martian.connect();
                  address = res?.address || (res?.raw && res.raw.account) || null;
                } else if (chosen === 'pontem' && Pontem.isAvailable()) {
                  const res = await Pontem.connect();
                  address = res?.address || (res?.raw && res.raw.account) || null;
                }
              }

              // Fallback mock address if provider not available or connect didn't return address
              if (!address) {
                address = `0x${Math.random().toString(16).substr(2, 40)}`;
              }

              // Wire signAndSubmit to adapter implementation when available
              const signAndSubmitImpl = (chosen === 'petra' && Petra.isAvailable()) ? Petra.signAndSubmit
                : (chosen === 'martian' && Martian.isAvailable()) ? Martian.signAndSubmit
                : (chosen === 'pontem' && Pontem.isAvailable()) ? Pontem.signAndSubmit
                : undefined;

              set({
                isConnected: true,
                address,
                walletType: chosen,
                balance: Math.random() * 1000,
                signAndSubmit: signAndSubmitImpl,
              });

              console.log(`Connected to ${chosen || 'mock'} wallet`);
            } catch (error: any) {
              // Log minimal diagnostic info (avoid full stack in console for upstream provider errors)
              console.error('Failed to connect wallet:', { message: error?.message, name: error?.name });
              // Friendly message for UI; include link to Aptos Wallet Standard for troubleshooting
              const friendlyMsg = error && error.message
                ? `Wallet connect error: ${error.message}. If this persists, ensure you're using an Aptos-compatible wallet (see https://aptos.dev/en/build/sdks/wallet-adapter/wallet-standards).`
                : 'Wallet connect failed. Ensure you have an Aptos-compatible wallet installed.';
              throw new Error(friendlyMsg);
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
      // Placeholder signAndSubmit - real wallet adapters should override this
      signAndSubmit: async () => {
        throw new Error('No wallet adapter configured to sign and submit transactions.');
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