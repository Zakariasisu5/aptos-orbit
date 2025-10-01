import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { getUserBalances } from '@/services/aptosService';

export interface Balance {
  balance: number;
  usdValue: number;
}

export interface Balances {
  [currency: string]: Balance;
}

export const useBalances = () => {
  const { address, isConnected } = useWalletStore();
  const [balances, setBalances] = useState<Balances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = async () => {
    if (!address || !isConnected) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedBalances = await getUserBalances(address);
      setBalances(fetchedBalances);
    } catch (err) {
      setError('Failed to fetch balances from blockchain');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBalances();
  }, [address, isConnected]);

  const totalValue = Object.values(balances).reduce(
    (sum, { usdValue }) => sum + usdValue, 
    0
  );

  return {
    balances,
    totalValue,
    isLoading,
    error,
    refreshBalances,
  };
};