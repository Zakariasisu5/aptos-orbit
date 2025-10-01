import { useState, useEffect } from 'react';
import { getFXRates } from '@/services/aptosService';

export interface FXRate {
  rate: number;
  change24h: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FXRates {
  [pair: string]: FXRate;
}

export const useFXRates = () => {
  const [rates, setRates] = useState<FXRates>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedRates = await getFXRates();
      setRates(fetchedRates);
    } catch (err) {
      setError('Failed to fetch exchange rates from blockchain');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRate = (fromCurrency: string, toCurrency: string): FXRate | null => {
    const pair = `${fromCurrency}/${toCurrency}`;
    const reversePair = `${toCurrency}/${fromCurrency}`;
    
    if (rates[pair]) {
      return rates[pair];
    } else if (rates[reversePair]) {
      return {
        ...rates[reversePair],
        rate: 1 / rates[reversePair].rate,
      };
    }
    
    return null;
  };

  useEffect(() => {
    refreshRates();
    
    // Auto-refresh rates every 30 seconds
    const interval = setInterval(refreshRates, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    isLoading,
    error,
    refreshRates,
    getRate,
  };
};