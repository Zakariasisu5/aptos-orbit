import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { 
  CONTRACT_MODULES, 
  SUPPORTED_CURRENCIES, 
  CURRENCY_DECIMALS, 
  NETWORK,
  GLOBE_CORE,
  GLOBE_BUSINESS,
  CONTRACT_FUNCTIONS 
} from '@/config/contracts';

// Initialize Aptos client
const config = new AptosConfig({ network: NETWORK as Network });
export const aptos = new Aptos(config);

// Get wallet provider
export const getWalletProvider = (walletType: 'petra' | 'martian' | 'pontem') => {
  if (typeof window === 'undefined') return null;
  
  switch (walletType) {
    case 'petra':
      return (window as any).aptos;
    case 'martian':
      return (window as any).martian;
    case 'pontem':
      return (window as any).pontem;
    default:
      return null;
  }
};

// Format balance from raw amount
export const formatBalance = (rawAmount: string | number, currency: string): number => {
  const decimals = CURRENCY_DECIMALS[currency as keyof typeof CURRENCY_DECIMALS] || 6;
  return Number(rawAmount) / Math.pow(10, decimals);
};

// Parse amount to raw value
export const parseAmount = (amount: number, currency: string): number => {
  const decimals = CURRENCY_DECIMALS[currency as keyof typeof CURRENCY_DECIMALS] || 6;
  return Math.floor(amount * Math.pow(10, decimals));
};

// Fetch user balances from Treasury.move
export const getUserBalances = async (address: string) => {
  try {
    const balances: Record<string, { balance: number; usdValue: number }> = {};
    
    for (const [currency, coinType] of Object.entries(SUPPORTED_CURRENCIES)) {
      try {
// Get coin balance using Aptos SDK
        const resource = await aptos.getAccountCoinAmount({
          accountAddress: address,
          coinType: coinType as `${string}::${string}::${string}`,
        });
        
        const balance = formatBalance(resource, currency);
        
        // For demo, assume 1:1 USD value for stablecoins
        let usdValue = balance;
        if (currency === 'APT') {
          usdValue = balance * 7.85; // Mock APT price
        } else if (currency === 'WETH') {
          usdValue = balance * 2000; // Mock ETH price
        }
        
        balances[currency] = { balance, usdValue };
      } catch (error) {
        // If coin not found, set to 0
        balances[currency] = { balance: 0, usdValue: 0 };
      }
    }
    
    return balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
};

// Store transaction locally for history tracking
const storeTransaction = (address: string, transaction: any) => {
  try {
    const key = `transactions_${address}`;
    const stored = localStorage.getItem(key);
    const transactions = stored ? JSON.parse(stored) : [];
    
    // Check if transaction already exists (by hash or id)
    const exists = transactions.some((tx: any) => 
      tx.txHash === transaction.txHash || tx.id === transaction.id
    );
    
    if (!exists) {
      transactions.unshift(transaction);
      // Keep last 100 transactions
      if (transactions.length > 100) transactions.splice(100);
      localStorage.setItem(key, JSON.stringify(transactions));
      console.log('✅ Transaction stored:', transaction.type, transaction.txHash);
    }
  } catch (error) {
    console.error('❌ Error storing transaction:', error);
  }
};

// Fetch transaction history from Audit.move events + local storage
export const getTransactionHistory = async (address: string) => {
  try {
    // Fetch on-chain transactions
    const onChainTxs = await aptos.getAccountTransactions({
      accountAddress: address,
      options: { limit: 50 }
    });
    
    const parsedTxs = onChainTxs.map((tx: any) => {
      const functionName = tx.payload?.function || '';
      let type: 'send' | 'receive' | 'swap' | 'payroll' = 'send';
      
      if (functionName.includes('batch_send')) {
        type = 'payroll';
      } else if (functionName.includes('swap')) {
        type = 'swap';
      } else if (tx.sender !== address) {
        type = 'receive';
      }
      
      return {
        id: tx.version?.toString() || tx.hash,
        type,
        amount: formatBalance(tx.payload?.arguments?.[1] || 0, 'USDC'),
        currency: 'USDC',
        recipient: tx.payload?.arguments?.[0],
        sender: tx.sender,
        status: tx.success ? 'completed' : 'failed',
        timestamp: new Date(Number(tx.timestamp) / 1000).toISOString(),
        txHash: tx.hash,
        fee: formatBalance(tx.gas_used || 0, 'APT'),
      };
    });
    
    // Fetch local transactions
    const key = `transactions_${address}`;
    const stored = localStorage.getItem(key);
    const localTxs = stored ? JSON.parse(stored) : [];
    
    // Merge and deduplicate (on-chain takes precedence)
    const txMap = new Map();
    [...parsedTxs, ...localTxs].forEach(tx => {
      if (!txMap.has(tx.txHash) && !txMap.has(tx.id)) {
        txMap.set(tx.txHash || tx.id, tx);
      }
    });
    
    return Array.from(txMap.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    // Fallback to local storage only
    const key = `transactions_${address}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
};

// Send stablecoin via GlobePayXCore::send_stablecoin
export const sendStablecoin = async (
  walletProvider: any,
  to: string,
  amount: number,
  currency: string
) => {
  try {
    const rawAmount = parseAmount(amount, currency);
    const coinType = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES];
    
    if (!coinType) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    
    const payload = {
      function: `${CONTRACT_MODULES.CORE}::${CONTRACT_FUNCTIONS.SEND_STABLECOIN}`,
      type_arguments: [coinType],
      arguments: [to, rawAmount],
    };
    
    console.log('📤 Sending stablecoin:', { to, amount, currency, rawAmount });
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    console.log('✅ Transaction successful:', response.hash);
    
    // Store transaction in local history
    const account = await walletProvider.account();
    const fromAddress = account?.address || account;
    
    storeTransaction(fromAddress, {
      id: response.hash,
      type: 'send',
      amount,
      currency,
      recipient: to,
      sender: fromAddress,
      status: 'completed',
      timestamp: new Date().toISOString(),
      txHash: response.hash,
      fee: 0,
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error sending stablecoin:', error);
    throw error;
  }
};

// Swap currency via GlobePayXCore::swap_request
export const swapCurrency = async (
  walletProvider: any,
  from: string,
  to: string,
  amount: number
) => {
  try {
    const rawAmount = parseAmount(amount, from);
    const coinTypeIn = SUPPORTED_CURRENCIES[from as keyof typeof SUPPORTED_CURRENCIES];
    const coinTypeOut = SUPPORTED_CURRENCIES[to as keyof typeof SUPPORTED_CURRENCIES];
    
    if (!coinTypeIn || !coinTypeOut) {
      throw new Error(`Unsupported currency pair: ${from}/${to}`);
    }
    
    // Mock exchange rate (1e18 precision) - in production, fetch from oracle
    const rate = 1000000000000000000n; // 1:1 rate for demo
    const minOut = 0; // Accept any output amount for demo
    
    const payload = {
      function: `${CONTRACT_MODULES.CORE}::${CONTRACT_FUNCTIONS.SWAP_REQUEST}`,
      type_arguments: [coinTypeIn, coinTypeOut],
      arguments: [rawAmount, minOut, rate.toString()],
    };
    
    console.log('🔄 Requesting swap:', { from, to, amount, rawAmount });
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    console.log('✅ Swap request successful:', response.hash);
    
    // Store transaction in local history
    const account = await walletProvider.account();
    const fromAddress = account?.address || account;
    
    storeTransaction(fromAddress, {
      id: response.hash,
      type: 'swap',
      amount,
      fromCurrency: from,
      toCurrency: to,
      currency: from,
      sender: fromAddress,
      status: 'processing',
      timestamp: new Date().toISOString(),
      txHash: response.hash,
      fee: 0,
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error swapping currency:', error);
    throw error;
  }
};

// Get FX rates from ForexSwap.move
export const getFXRates = async () => {
  try {
    // Placeholder implementation - will be replaced with actual contract query
    // For now, return fallback rates until contracts are deployed
    return {
      'APT/USDC': { rate: 7.85, change24h: 2.3, trend: 'up' as const },
      'USDT/USDC': { rate: 1.0001, change24h: 0.01, trend: 'stable' as const },
      'WETH/USDC': { rate: 2000.0, change24h: 5.4, trend: 'up' as const },
    };
    
    /* Example implementation (uncomment when contracts are deployed):
    const ratesResource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESSES.FOREX_SWAP,
      resourceType: `${CONTRACT_ADDRESSES.FOREX_SWAP}::forex_swap::RatesTable`,
    });
    
    const ratesData = ratesResource.data as Record<string, { rate: number; change_24h: number }>;
    const rates: Record<string, { rate: number; change24h: number; trend: 'up' | 'down' | 'stable' }> = {};
    
    for (const [pair, data] of Object.entries(ratesData)) {
      const change = Number(data.change_24h) / 100;
      rates[pair] = {
        rate: Number(data.rate) / 10000,
        change24h: change,
        trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
      };
    }
    
    return rates;
    */
  } catch (error) {
    console.error('Error fetching FX rates:', error);
    // Fallback to basic rates if contract not available
    return {
      'APT/USDC': { rate: 7.85, change24h: 2.3, trend: 'up' as const },
      'USDT/USDC': { rate: 1.0001, change24h: 0.01, trend: 'stable' as const },
    };
  }
};

// Batch payroll send via GlobePayXBusiness::batch_pay
export const batchPayrollSend = async (
  walletProvider: any,
  recipients: Array<{ wallet: string; amount: number; currency: string }>
) => {
  try {
    if (!recipients.length) {
      throw new Error('No recipients provided');
    }
    
    const addresses = recipients.map(r => r.wallet);
    const amounts = recipients.map(r => parseAmount(r.amount, r.currency));
    const currency = recipients[0]?.currency || 'APT';
    const coinType = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES];
    
    if (!coinType) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    
    // Memo for the batch payment
    const memo = new TextEncoder().encode(`Payroll batch - ${recipients.length} recipients`);
    
    const payload = {
      function: `${CONTRACT_MODULES.BUSINESS}::${CONTRACT_FUNCTIONS.BATCH_PAY}`,
      type_arguments: [coinType],
      arguments: [addresses, amounts, Array.from(memo)],
    };
    
    console.log('💼 Sending batch payroll:', { 
      recipients: recipients.length, 
      currency, 
      totalAmount: recipients.reduce((sum, r) => sum + r.amount, 0) 
    });
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    console.log('✅ Batch payroll successful:', response.hash);
    
    // Store transaction in local history
    const account = await walletProvider.account();
    const fromAddress = account?.address || account;
    const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);
    
    storeTransaction(fromAddress, {
      id: response.hash,
      type: 'payroll',
      amount: totalAmount,
      currency,
      sender: fromAddress,
      batchSize: recipients.length,
      status: 'completed',
      timestamp: new Date().toISOString(),
      txHash: response.hash,
      fee: 0,
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error sending batch payroll:', error);
    throw error;
  }
};

// Get treasury breakdown
export const getTreasuryBreakdown = async (address: string) => {
  try {
    const balances = await getUserBalances(address);
    
    return Object.entries(balances).map(([currency, data]) => ({
      currency,
      balance: data.balance,
      usdValue: data.usdValue,
      percentage: 0, // Calculate after fetching all
    }));
  } catch (error) {
    console.error('Error fetching treasury breakdown:', error);
    throw error;
  }
};
