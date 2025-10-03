// Smart Contract Addresses and Configuration
export const NETWORK = 'testnet'; // Change to 'mainnet' for production

// NOTE: Replace these with your actual deployed contract addresses
// After deploying contracts, update GLOBE_CORE and GLOBE_BUSINESS addresses
export const GLOBE_CORE = '0x1'; // Replace with GLOBE_CORE module address
export const GLOBE_BUSINESS = '0x1'; // Replace with GLOBE_BUSINESS module address

export const CONTRACT_MODULES = {
  CORE: `${GLOBE_CORE}::GlobePayXCore`,
  BUSINESS: `${GLOBE_BUSINESS}::GlobePayXBusiness`,
};

// Supported coin types on Aptos testnet
export const SUPPORTED_CURRENCIES = {
  APT: '0x1::aptos_coin::AptosCoin',
  // Add your custom stablecoin types here after deployment
  // USDC: '0xYourAddress::usdc::USDC',
  // USDT: '0xYourAddress::usdt::USDT',
};

export const CURRENCY_DECIMALS = {
  APT: 8,
  USDC: 6,
  USDT: 6,
  WETH: 8,
};

// Contract function names
export const CONTRACT_FUNCTIONS = {
  // GlobePayXCore functions
  SEND_STABLECOIN: 'send_stablecoin',
  SWAP_REQUEST: 'swap_request',
  EXECUTE_SWAP: 'execute_swap',
  GET_SWAP_FEE: 'get_swap_fee_bps',
  GET_SWAP_INFO: 'get_swap_info',
  
  // GlobePayXBusiness functions
  CREATE_ORG: 'create_org',
  BATCH_PAY: 'batch_pay',
  INIT_TREASURY: 'init_treasury',
  FUND_TREASURY: 'fund_treasury',
  INTERNAL_TRANSFER: 'internal_transfer',
  WITHDRAW_FROM_TAG: 'withdraw_from_tag',
  GET_TREASURY_BALANCE: 'get_treasury_balance',
};
