// Petra adapter (lightweight wrapper)
import { AptosClient } from 'aptos';
import { getNodeUrl } from '../client';

export const isAvailable = () => {
  // Petra injects `window.aptos` in some implementations or `window.petra` in others
  try {
    // @ts-ignore - prefer the standardized provider `window.aptos`; avoid touching vendor-specific `window.petra` to prevent inpage warnings
    return typeof window !== 'undefined' && !!(window as any).aptos;
  } catch (e) {
    return false;
  }
};

export async function connect() {
  // Prefer the standardized provider exposed at window.aptos. Avoid reading window.petra to prevent inpage deprecation logs.
  // @ts-ignore
  const provider = (window as any).aptos;
  if (!provider) throw new Error('Petra provider (window.aptos) not found');
  // Basic sanity checks: avoid calling into Ethereum providers (MetaMask) which may expose a connect method
  if (provider.isMetaMask || provider.isEthereum || (provider.request && typeof provider.request === 'function' && provider.request.name?.includes('request'))) {
    throw new Error('Detected an Ethereum provider (e.g. MetaMask) where an Aptos wallet was expected');
  }

  // provider.connect() is common for Aptos wallets — try a few common shapes/options
  let res: any = null;
  try {
    if (typeof provider.connect === 'function') {
      try {
        // Some providers accept options (silently/requestPermissions)
        res = await provider.connect();
      } catch (inner) {
        // try with common option shapes
        try {
          // @ts-ignore
          res = await provider.connect({ silently: true });
        } catch (inner2) {
          // last attempt: call provider.connect with no args and let it bubble
          res = await provider.connect();
        }
      }
    } else if (typeof provider.request === 'function') {
      // Fallback for providers exposing a request method (non-Ethereum request shapes are possible)
      try {
        // Some Aptos inpage providers expose custom RPC-like requests. We attempt a generic 'connect' if available.
        // NOTE: we avoid sending Ethereum-specific requests here; this should only run for Aptos-shaped providers.
        // @ts-ignore
        res = await provider.request({ method: 'aptos_connect' });
      } catch (reqErr) {
        // If the request indicates MetaMask or Ethereum, throw a clear error
        const m = (reqErr && reqErr.message) ? String(reqErr.message).toLowerCase() : '';
        if (m.includes('metamask') || m.includes('ethereum')) {
          throw new Error('Attempted to connect to an Ethereum extension (MetaMask). Please use an Aptos wallet like Petra.');
        }
        throw reqErr;
      }
    } else {
      throw new Error('Petra provider has no connect or request method');
    }
  } catch (e: any) {
    // If provider threw a MetaMask-specific error, convert to a clearer message
    const msg = e && e.message ? String(e.message) : String(e);
    if (msg.toLowerCase().includes('metamask') || msg.toLowerCase().includes('ethereum')) {
      throw new Error('Attempted to connect to an Ethereum extension (MetaMask). Please use an Aptos wallet like Petra.');
    }
    // Petra inpage may throw PetraApiError — surface the name for clearer logs but wrap for UI
    if (e && e.name === 'PetraApiError') {
      throw new Error('Petra connection failed: ' + (e.message || 'unknown Petra error') + '. Note: direct PetraApiClient usage will be deprecated — consider the Aptos Wallet Standard.');
    }
    throw e;
  }
  // Try to extract address in common shapes
  const address = res?.address || res?.account || (provider?.account ? provider.account.address : undefined) || undefined;
  return { raw: res, address };
}

export async function disconnect() {
  try {
    // Prefer standardized provider; avoid touching vendor-specific window.petra when possible
    // @ts-ignore
    const provider = (window as any).aptos;
    if (provider && typeof provider.disconnect === 'function') {
      await provider.disconnect();
    }
  } catch (e) {
    console.warn('Petra disconnect error', e);
  }
}

export async function signAndSubmit(payload: any) {
  // Adapter is expected to accept a transaction payload and return a result
  // The exact API differs between wallets; this is a best-effort wrapper
  // If payload.signedTxn is present and no provider is available, return it for REST submission
  // Prefer standardized provider; avoid reading window.petra to reduce vendor inpage logs
  // @ts-ignore
  const provider = (window as any).aptos;

  if (!provider) {
    if (payload && payload.signedTxn) {
      // No provider — caller provided signedTxn to be submitted by REST
      return { submitted: false, signedTxn: payload.signedTxn };
    }
    throw new Error('Petra provider not available');
  }

  // Try multiple signing API shapes
  if (typeof provider.signAndSubmitTransaction === 'function') {
    return await provider.signAndSubmitTransaction(payload);
  }

  if (typeof provider.signAndSubmit === 'function') {
    return await provider.signAndSubmit(payload);
  }

  // Some providers expose signTransaction / sign — use AptosClient to generate a raw txn then ask provider to sign
  if (typeof provider.signTransaction === 'function' || typeof provider.sign === 'function') {
    const signer = provider.signTransaction || provider.sign;
    // try to get sender address
    const sender = provider.address || (provider.account && provider.account.address) || undefined;
    if (!sender) throw new Error('Cannot determine sender address for transaction generation');

  const client = new AptosClient(getNodeUrl());
    const rawTxn = await client.generateTransaction(sender, payload);
    const signed = await signer(rawTxn);

    if (typeof provider.submitTransaction === 'function') {
      return await provider.submitTransaction(signed);
    }

    // Try to submit via AptosClient if signed is BCS
    try {
      // AptosClient accepts signed BCS transaction as Uint8Array or hex
      // @ts-ignore
      if (signed && signed || signed && signed.signature) {
        // try client.submitSignedBCSTransaction
        // @ts-ignore
        return await client.submitSignedBCSTransaction(signed);
      }
    } catch (e) {
      // ignore and fallthrough
    }

    return { submitted: false, signedTxn: signed };
  }

  throw new Error('No supported signAndSubmit method found on Petra provider');
}

export default {
  isAvailable,
  connect,
  disconnect,
  signAndSubmit,
};
