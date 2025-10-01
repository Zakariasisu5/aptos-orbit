// Mock data removed - now using live Aptos blockchain data via hooks
// Only keeping UI-only mock data (sponsors, testimonials, user profile)

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