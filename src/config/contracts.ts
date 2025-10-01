// Smart Contract Addresses and Configuration
export const NETWORK = 'testnet'; // Change to 'mainnet' for production

export const CONTRACT_ADDRESSES = {
  TREASURY: '0x1', // Replace with your deployed Treasury.move address
  REMITTANCE: '0x1', // Replace with your deployed Remittance.move address
  FOREX_SWAP: '0x1', // Replace with your deployed ForexSwap.move address
  PAYROLL: '0x1', // Replace with your deployed Payroll.move address
  AUDIT: '0x1', // Replace with your deployed Audit.move address
};

export const SUPPORTED_CURRENCIES = {
  USDC: '0x1::coin::Coin<USDC>',
  USDT: '0x1::coin::Coin<USDT>',
  APT: '0x1::aptos_coin::AptosCoin',
  WETH: '0x1::coin::Coin<WETH>',
};

export const CURRENCY_DECIMALS = {
  USDC: 6,
  USDT: 6,
  APT: 8,
  WETH: 8,
};
