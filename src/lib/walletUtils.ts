export function isPetraAvailable(): boolean {
  // Petra injects `window.aptos` with a provider name or specific fields
  try {
    // @ts-ignore
    return typeof window !== 'undefined' && typeof (window as any).aptos !== 'undefined';
  } catch (e) {
    return false;
  }
}

export function isMartianAvailable(): boolean {
  try {
    // @ts-ignore
    return typeof window !== 'undefined' && typeof (window as any).martian !== 'undefined';
  } catch (e) {
    return false;
  }
}

export function isPontemAvailable(): boolean {
  try {
    // @ts-ignore
    return typeof window !== 'undefined' && typeof (window as any).pontem !== 'undefined';
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
