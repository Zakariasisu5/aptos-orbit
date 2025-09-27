import { useEffect, useState } from 'react';

export function useWallet(): { account?: any; connected: boolean } {
  const [account, setAccount] = useState<any | undefined>(undefined);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Minimal stub: attempt to read a wallet object on window (if a wallet injects one),
    // otherwise remain disconnected; adjust or extend this implementation to fit your wallet provider.
    try {
      const w = typeof window !== 'undefined' ? (window as any) : null;
      if (w?.aptos) {
        const maybeAccount = w.aptos?.account ?? w.aptos?.selectedAddress ?? undefined;
        if (maybeAccount) {
          setAccount(maybeAccount.address ?? maybeAccount);
          setConnected(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return { account, connected };
}