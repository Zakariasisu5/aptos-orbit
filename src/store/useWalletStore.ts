import { create } from 'zustand';

type WalletType = 'petra' | 'martian' | 'pontem';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType | null;
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  walletType: null,

  connect: async (walletType: WalletType) => {
    let wallet: any;

    if (walletType === 'petra' && (window as any).aptos) {
      wallet = (window as any).aptos;
    } else if (walletType === 'martian' && (window as any).martian) {
      wallet = (window as any).martian;
    } else if (walletType === 'pontem' && (window as any).pontem) {
      wallet = (window as any).pontem;
    } else {
      throw new Error(`${walletType} wallet not found`);
    }

    // Ask extension to connect
    const account = await wallet.connect();

    set({
      isConnected: true,
      address: account.address,
      walletType,
    });
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      walletType: null,
    });
  },
}));
