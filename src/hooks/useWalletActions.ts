import { useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';

/**
 * Lightweight wallet actions hook.
 * - Detects common wallet adapter methods at runtime (signAndSubmitTransaction / signAndSubmit / sendTransaction)
 * - Provides sendCoin(recipient, amount, coinType, opts) and signAndSubmit(payload)
 * - Falls back to a simulated response when no adapter is available
 */
export default function useWalletActions() {
  // call underlying wallet hook (guarded at runtime by React rules)
  let wallet: any = null;
  try {
    wallet = useWallet();
  } catch (e) {
    // useWallet may throw if an injected provider is broken — swallow here and treat as no-wallet
    wallet = null;
  }

  const signAndSubmit = useCallback(async (payload: any) => {
    // Prefer common adapter methods
    const adapter =
      wallet?.signAndSubmitTransaction ??
      wallet?.signAndSubmit ??
      wallet?.signAndSubmitEntryFunction ??
      wallet?.signAndSendTransaction ??
      null;

    if (adapter) {
      // Pass through to adapter; callers should provide payload in the adapter-expected shape
      const res = await adapter(payload);
      // normalize some returned shapes
      const hash =
        res?.hash ??
        res?.transaction_hash ??
        res?.result?.hash ??
        res?.res?.hash ??
        (typeof res === 'string' ? res : undefined);
      return { raw: res, hash };
    }

    // Simulation fallback
    await new Promise((r) => setTimeout(r, 250));
    const fake = `0xSIM${Date.now().toString(36)}`;
    return { raw: null, hash: fake };
  }, [wallet]);

  const sendCoin = useCallback(
    async (recipient: string, amount: string | number, coinType = '0x1::aptos_coin::AptosCoin', opts?: any) => {
      // build a standard Aptos entry_function_payload for coin transfer
      // many adapters accept the entry_function_payload shape:
      const payload = {
        type: 'entry_function_payload',
        function: String(coinType),
        type_arguments: [],
        arguments: [recipient, String(amount)],
        ...opts?.payloadExtras
      };

      // Some adapters expect an object with requestType, others expect raw payload.
      // Try common signatures via signAndSubmit wrapper above.
      const res = await signAndSubmit(payload);

      // normalize response to include explorer-ish url if possible
      const txHash = res?.hash ?? res?.raw?.hash ?? res?.raw?.transaction_hash ?? undefined;

      return {
        res,
        hash: txHash,
        explorer: txHash ? `${opts?.explorerHost ?? 'https://explorer.aptoslabs.com'}/txn/${txHash}` : undefined
      };
    },
    [signAndSubmit]
  );

  return {
    // action methods
    sendCoin,
    signAndSubmit,
    // pass-through wallet state (if present) for callers that need it
    account: wallet?.account ?? wallet?.address ?? null,
    connected: Boolean(wallet?.connected ?? wallet?.isConnected ?? false),
  };
}