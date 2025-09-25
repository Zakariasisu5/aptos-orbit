export function isPetraAvailable(): boolean {
  // Petra injects `window.aptos` with a provider name or specific fields
  try {
    // @ts-ignore
    // prefer standardized provider
    const maybe = typeof window !== 'undefined' ? (window as any).aptos || (window as any).petra : undefined;
    if (!maybe) return false;
    // Avoid Ethereum providers being misdetected as Aptos wallets
    if (maybe.isMetaMask || maybe.isEthereum) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function isMartianAvailable(): boolean {
  try {
    // @ts-ignore
    const maybe = typeof window !== 'undefined' ? (window as any).martian : undefined;
    if (!maybe) return false;
    if (maybe.isMetaMask || maybe.isEthereum || typeof maybe.request === 'function') return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function isPontemAvailable(): boolean {
  try {
    // @ts-ignore
    const maybe = typeof window !== 'undefined' ? (window as any).pontem : undefined;
    if (!maybe) return false;
    if (maybe.isMetaMask || maybe.isEthereum || typeof maybe.request === 'function') return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function isWalletAvailable(walletType: 'petra' | 'martian' | 'pontem') {
  switch (walletType) {
    case 'petra':
      return isPetraAvailable();
    case "martian":
      return isMartianAvailable();
    case 'pontem':
      return isPontemAvailable();
    default:
      return false;
  }
}
