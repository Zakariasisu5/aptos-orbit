import { useState, useEffect } from 'react';
import { mockBalances } from '@/services/mockData';

export interface Balance {
  balance: number;
  usdValue: number;
}

export interface Balances {
  [currency: string]: Balance;
}

export const useBalances = () => {
  const [balances, setBalances] = useState<Balances>(mockBalances);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, would fetch from blockchain/API
      setBalances(mockBalances);
    } catch (err) {
      setError('Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBalances();
  }, []);

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