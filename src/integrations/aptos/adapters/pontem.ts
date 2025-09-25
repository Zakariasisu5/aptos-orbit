// Pontem adapter (lightweight wrapper)
import { AptosClient } from 'aptos';
import { getNodeUrl } from '../client';

export const isAvailable = () => {
  try {
    // @ts-ignore
    return typeof window !== 'undefined' && !!(window as any).pontem;
  } catch (e) {
    return false;
  }
};

export async function connect() {
  // @ts-ignore
  const provider = (window as any).pontem;
  if (!provider) throw new Error('Pontem provider not found');
  if (provider.isMetaMask || provider.isEthereum || (provider.request && typeof provider.request === 'function' && provider.request.name?.includes('request'))) {
    throw new Error('Detected an Ethereum provider (e.g. MetaMask) where an Aptos wallet was expected');
  }

  const res = await provider.connect();
  const address = res?.address || res?.account || (provider.account ? provider.account.address : undefined) || undefined;
  return { raw: res, address };
}

export async function disconnect() {
  try {
    // @ts-ignore
    const provider = (window as any).pontem;
    if (provider && typeof provider.disconnect === 'function') {
      await provider.disconnect();
    }
  } catch (e) {
    console.warn('Pontem disconnect error', e);
  }
}

export async function signAndSubmit(payload: any) {
  // @ts-ignore
  const provider = (window as any).pontem;
  if (!provider) {
    if (payload && payload.signedTxn) return { submitted: false, signedTxn: payload.signedTxn };
    throw new Error('Pontem provider not available');
  }
  if (typeof provider.signAndSubmitTransaction === 'function') {
    return await provider.signAndSubmitTransaction(payload);
  }
  if (typeof provider.signAndSubmit === 'function') {
    return await provider.signAndSubmit(payload);
  }

  if (typeof provider.signTransaction === 'function' || typeof provider.sign === 'function') {
    const signer = provider.signTransaction || provider.sign;
    const sender = provider.address || (provider.account && provider.account.address) || undefined;
    if (!sender) throw new Error('Cannot determine sender address for transaction generation');
  const client = new AptosClient(getNodeUrl());
    const rawTxn = await client.generateTransaction(sender, payload);
    const signed = await signer(rawTxn);
    if (typeof provider.submitTransaction === 'function') {
      return await provider.submitTransaction(signed);
    }
    try {
      // @ts-ignore
      return await client.submitSignedBCSTransaction(signed);
    } catch (e) {
      return { submitted: false, signedTxn: signed };
    }
  }
  throw new Error('No supported signAndSubmit method found on Pontem provider');
}

export default { isAvailable, connect, disconnect, signAndSubmit };
