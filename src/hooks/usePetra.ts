import { useCallback } from 'react';

type Provider = any;

function findAptosProvider(): Provider | null {
  if (typeof window === 'undefined') return null;
  // common injection points - Petra exposes window.aptos, some wallets use other keys
  return (window as any).aptos ?? (window as any).petra ?? (window as any).aptosWallet ?? null;
}

/**
 * Simple helper to connect to an injected Aptos wallet (Petra etc).
 * - Tries several common APIs safely.
 * - Returns { success, provider, error }
 */
export default function usePetra() {
  const connect = useCallback(async () => {
    const provider = findAptosProvider();
    if (!provider) {
      return { success: false, error: 'No injected Aptos wallet found (window.aptos missing).' };
    }

    // prevent provider errors from bubbling uncaught
    try {
      // Some providers expose .connect()
      if (typeof provider.connect === 'function') {
        const res = await provider.connect();
        // provider.connect may return account or void
        const account = res ?? (provider.account ? provider.account() : undefined);
        return { success: true, provider, account };
      }

      // Some providers expose request / enable style (Metamask-like)
      if (typeof provider.request === 'function') {
        // attempt common request patterns - this may vary by wallet
        try {
          const accounts = await provider.request({ method: 'aptos_requestAccounts' });
          return { success: true, provider, accounts };
        } catch {
          // ignore and fallthrough
        }
      }

      // Some wallets expose isConnected/connectWithOptions or similar
      if (typeof provider.connectToWallet === 'function') {
        const r = await provider.connectToWallet();
        return { success: true, provider, account: r };
      }

      // best-effort: try account() or isConnected flags
      if (typeof provider.account === 'function') {
        const a = await provider.account();
        return { success: true, provider, account: a };
      }

      // nothing matched
      return { success: false, provider, error: 'Provider found but no supported connect API present.' };
    } catch (err: any) {
      // normalize transport/undefined errors and avoid unhandled rejections
      const msg = err?.message ?? String(err);
      return { success: false, provider, error: `connect failed: ${msg}` };
    }
  }, []);

  return { connect, findProvider: findAptosProvider };
}