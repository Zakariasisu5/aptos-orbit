import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { CONTRACT_ADDRESSES, SUPPORTED_CURRENCIES, CURRENCY_DECIMALS, NETWORK } from '@/config/contracts';

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

// Fetch transaction history from Audit.move events
export const getTransactionHistory = async (address: string) => {
  try {
    // Note: This uses a placeholder implementation as the actual Aptos SDK method 
    // may differ depending on your contract implementation
    // You'll need to replace this with the actual contract query once deployed
    
    // For now, return empty array until contracts are deployed
    // Replace with actual event fetching once contracts are live
    return [];
    
    /* Example implementation (uncomment when contracts are deployed):
    const events = await aptos.getAccountTransactions({
      accountAddress: address,
    });
    
    return events.map((event: any) => ({
      id: event.version.toString(),
      type: event.payload?.function?.split('::').pop() || 'unknown',
      amount: formatBalance(event.payload?.arguments?.[1] || 0, 'USDC'),
      currency: 'USDC',
      recipient: event.payload?.arguments?.[0],
      sender: address,
      status: event.success ? 'completed' : 'failed',
      timestamp: new Date(Number(event.timestamp) / 1000).toISOString(),
      txHash: event.hash,
      fee: formatBalance(event.gas_used || 0, 'APT'),
    }));
    */
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};

// Send stablecoin via Remittance.move
export const sendStablecoin = async (
  walletProvider: any,
  to: string,
  amount: number,
  currency: string
) => {
  try {
    const rawAmount = parseAmount(amount, currency);
    
    const payload = {
      function: `${CONTRACT_ADDRESSES.REMITTANCE}::remittance::send_payment`,
      type_arguments: [SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]],
      arguments: [to, rawAmount],
    };
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    return response;
  } catch (error) {
    console.error('Error sending stablecoin:', error);
    throw error;
  }
};

// Swap currency via ForexSwap.move
export const swapCurrency = async (
  walletProvider: any,
  from: string,
  to: string,
  amount: number
) => {
  try {
    const rawAmount = parseAmount(amount, from);
    
    const payload = {
      function: `${CONTRACT_ADDRESSES.FOREX_SWAP}::forex_swap::swap`,
      type_arguments: [
        SUPPORTED_CURRENCIES[from as keyof typeof SUPPORTED_CURRENCIES],
        SUPPORTED_CURRENCIES[to as keyof typeof SUPPORTED_CURRENCIES],
      ],
      arguments: [rawAmount, 0], // minAmountOut = 0 for simplicity
    };
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    return response;
  } catch (error) {
    console.error('Error swapping currency:', error);
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

// Batch payroll send via Payroll.move
export const batchPayrollSend = async (
  walletProvider: any,
  recipients: Array<{ wallet: string; amount: number; currency: string }>
) => {
  try {
    const addresses = recipients.map(r => r.wallet);
    const amounts = recipients.map(r => parseAmount(r.amount, r.currency));
    const currency = recipients[0]?.currency || 'USDC';
    
    const payload = {
      function: `${CONTRACT_ADDRESSES.PAYROLL}::payroll::batch_send`,
      type_arguments: [SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]],
      arguments: [addresses, amounts],
    };
    
    const response = await walletProvider.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    return response;
  } catch (error) {
    console.error('Error sending batch payroll:', error);
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
