/**
 * Minimal Aptos REST client helpers.
 * - readResource: GET /accounts/:address/resource/:resource_type
 * - submitTransaction: helper that expects signed transaction payload (signed by wallet)
 *
 * This is intentionally small and dependency-free so you can wire it to any wallet adapter.
 */

// Browser-safe node URL resolution. Prefer Vite env var, fall back to legacy REACT_APP_* and then default.
export function getNodeUrl() {
  // Prefer Vite env: import.meta.env.VITE_APTOS_NODE_URL or REACT_APP_APTOS_NODE_URL
  try {
    // attempt to read Vite's import.meta.env; referencing import.meta may throw in some environments, so guard with nested try/catch
    // @ts-ignore
    let meta: any = undefined;
    try {
      // @ts-ignore
      meta = import.meta as any;
    } catch (e) {
      meta = undefined;
    }
    // @ts-ignore
    const fromVite = meta && meta.env && (meta.env.VITE_APTOS_NODE_URL || meta.env.REACT_APP_APTOS_NODE_URL);
    // @ts-ignore
    const fromProcess = typeof process !== 'undefined' && process && process.env ? (process.env.REACT_APP_APTOS_NODE_URL as string | undefined) : undefined;
    return (fromVite as string) || fromProcess || 'https://fullnode.devnet.aptos.dev/v1';
  } catch (e) {
    return 'https://fullnode.devnet.aptos.dev/v1';
  }
}

export async function readResource(address: string, resourceType: string, nodeUrl = getNodeUrl()) {
  const url = `${nodeUrl}/accounts/${encodeURIComponent(address)}/resource/${encodeURIComponent(resourceType)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to read resource: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function submitTransaction(signedTxn: any, nodeUrl?: string) {
  const resolvedNode = nodeUrl || getNodeUrl();
  // signedTxn should be the fully signed transaction bytes (B64 or hex depending on wallet)
  const url = `${resolvedNode}/transactions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signedTxn),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to submit transaction: ${res.status} ${txt}`);
  }
  return res.json();
}

export default {
  readResource,
  submitTransaction,
};
