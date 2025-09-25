import { useCallback } from 'react';
import { useWalletStore } from '@/store/walletStore';
import aptosClient from '@/integrations/aptos/client';

/** Minimal hook for contract interactions */
export const useContract = () => {
  const wallet = useWalletStore();

  const readResource = useCallback(async (address: string, resourceType: string) => {
    return await aptosClient.readResource(address, resourceType);
  }, []);

  const submitWithWallet = useCallback(async (payload: any) => {
    // This function expects a wallet to sign the transaction. The implementation here is
    // adapter-agnostic: it expects walletStore to expose a `signAndSubmit` method if a real adapter
    // is wired. For now the walletStore is mocked; once you add a wallet adapter, implement signAndSubmit.
    if (!wallet.isConnected || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    // If the wallet provides a signAndSubmit method, use it
    // @ts-ignore - may not exist on the mocked store
    if (typeof wallet.signAndSubmit === 'function') {
      // signAndSubmit should return the transaction result
      return await wallet.signAndSubmit(payload);
    }

    // Otherwise, expect the caller to provide a signed transaction object and submit via REST
    if (!payload.signedTxn) {
      throw new Error('No signed transaction provided and no wallet adapter available');
    }

    return await aptosClient.submitTransaction(payload.signedTxn);
  }, [wallet]);

  return {
    readResource,
    submitWithWallet,
  } as const;
};

export default useContract;
