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
    type: 'send',
    amount: 500.00,
    currency: 'USDC',
    recipient: 'john.doe@example.com',
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    txHash: '0xabc123...',
    fee: 0.25,
  },
  {
    id: '2',
    type: 'receive',
    amount: 1200.00,
    currency: 'USDT',
    sender: 'alice.smith@example.com',
    status: 'completed',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    txHash: '0xdef456...',
    fee: 0.30,
  },
  {
    id: '3',
    type: 'swap',
    amount: 100.00,
    fromCurrency: 'APT',
    toCurrency: 'USDC',
    rate: 7.85,
    status: 'completed',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    txHash: '0xghi789...',
    fee: 0.15,
  },
  {
    id: '4',
    type: 'payroll',
    amount: 2500.00,
    currency: 'USDC',
    batchSize: 25,
    status: 'processing',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    txHash: '0xjkl012...',
    fee: 12.50,
  },
];

export const mockFXRates = {
  'APT/USDC': { rate: 7.85, change24h: 2.3, trend: 'up' },
  'WETH/USDC': { rate: 1996.50, change24h: -1.2, trend: 'down' },
  'USDT/USDC': { rate: 1.0001, change24h: 0.01, trend: 'stable' },
};

export const mockPayrollData = [
  {
    id: '1',
    employee: 'John Doe',
    email: 'john.doe@company.com',
    wallet: '0x1234...5678',
    amount: 3500.00,
    currency: 'USDC',
    status: 'completed',
  },
  {
    id: '2',
    employee: 'Alice Smith',
    email: 'alice.smith@company.com',
    wallet: '0x9876...5432',
    amount: 4200.00,
    currency: 'USDC',
    status: 'pending',
  },
  {
    id: '3',
    employee: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    wallet: '0x1111...2222',
    amount: 3800.00,
    currency: 'USDC',
    status: 'completed',
  },
];

export const mockTreasuryData = {
  totalValue: 28570.46,
  allocation: [
    { currency: 'USDC', amount: 12543.67, percentage: 43.9 },
    { currency: 'USDT', amount: 8901.23, percentage: 31.2 },
    { currency: 'WETH', amount: 4890.00, percentage: 17.1 },
    { currency: 'APT', amount: 1234.56, percentage: 4.3 },
    { currency: 'Other', amount: 1001.00, percentage: 3.5 },
  ],
  history: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: 28570.46 + (Math.random() - 0.5) * 2000,
  })).reverse(),
};

export const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  wallet: '0xabcd...efgh',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  kycStatus: 'verified',
  preferences: {
    currency: 'USDC',
    notifications: true,
    darkMode: true,
  },
};