// Mock data for development and demo purposes

export const mockBalances = {
  USDC: { balance: 12543.67, usdValue: 12543.67 },
  USDT: { balance: 8901.23, usdValue: 8901.23 },
  APT: { balance: 156.78, usdValue: 1234.56 },
  WETH: { balance: 2.45, usdValue: 4890.00 },
};

export const mockTransactions = [
  {
    id: '1',
    type: 'send' as const,
    amount: 500.00,
    currency: 'USDC',
    recipient: 'john.doe@techcorp.com',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    txHash: '0xabc123...',
    fee: 0.25,
  },
  {
    id: '2',
    type: 'receive' as const,
    amount: 1200.00,
    currency: 'USDT',
    sender: 'alice.smith@globalpay.com',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    txHash: '0xdef456...',
    fee: 0.30,
  },
  {
    id: '3',
    type: 'swap' as const,
    amount: 100.00,
    currency: 'USDC',
    fromCurrency: 'APT',
    toCurrency: 'USDC',
    rate: 7.85,
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    txHash: '0xghi789...',
    fee: 0.15,
  },
  {
    id: '4',
    type: 'payroll' as const,
    amount: 2500.00,
    currency: 'USDC',
    batchSize: 25,
    status: 'processing' as const,
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    txHash: '0xjkl012...',
    fee: 12.50,
  },
];

// FX rates removed

// Minimal FX rates kept for UI/hooks compatibility
export const mockFXRates = {
  'APT/USDC': { rate: 7.85, change24h: 2.3, trend: 'up' as const },
  'USDT/USDC': { rate: 1.0001, change24h: 0.01, trend: 'stable' as const },
};

export const mockPayrollData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    wallet: '0x1234...5678',
    amount: 3500.00,
    currency: 'USDC',
    status: 'completed' as const,
  },
  {
    id: '2',
    name: 'Alice Smith',
    email: 'alice.smith@company.com',
    wallet: '0x9876...5432',
    amount: 4200.00,
    currency: 'USDC',
    status: 'pending' as const,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    wallet: '0x1111...2222',
    amount: 3800.00,
    currency: 'USDC',
    status: 'completed' as const,
  },
];

export const mockSponsors = [
  { name: 'Aptos Foundation', logo: '🚀', description: 'Layer 1 Blockchain' },
  { name: 'Circle', logo: '⭕', description: 'USDC Issuer' },
  { name: 'Binance', logo: '🟡', description: 'Global Exchange' },
  { name: 'Coinbase', logo: '🔵', description: 'Crypto Platform' },
  { name: 'Visa', logo: '💳', description: 'Payment Network' },
  { name: 'Mastercard', logo: '🔴', description: 'Financial Services' },
  { name: 'JP Morgan', logo: '🏦', description: 'Investment Bank' },
  { name: 'Goldman Sachs', logo: '💰', description: 'Investment Bank' },
];

export const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'CFO at TechCorp',
    avatar: '👩‍💼',
    content: 'GlobePayX revolutionized our international payroll. What used to take days now happens in seconds.',
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Founder at StartupLabs',
    avatar: '👨‍💻',
    content: 'The seamless multi-currency support and low fees make GlobePayX perfect for our global team.',
  },
  {
    id: '3',
    name: 'Aisha Patel',
    role: 'Finance Director at GlobalTech',
    avatar: '👩‍💼',
    content: 'The platform helped streamline our cross-border payroll and financial operations.',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Operations Manager at RemoteFirst',
    avatar: '👨‍💼',
    content: 'Cross-border payments are no longer a headache. GlobePayX handles everything beautifully.',
  },
  {
    id: '5',
    name: 'Elena Vasquez',
    role: 'Head of Finance at ScaleUp',
    avatar: '👩‍💼',
    content: 'The automated payroll features saved us hundreds of hours monthly. Game-changing platform.',
  },
];

// Treasury data removed

export const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@globepay.io',
  wallet: '0xabcd...efgh',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  kycStatus: 'verified',
  preferences: {
    currency: 'USDC',
    notifications: true,
    darkMode: true,
  },
};