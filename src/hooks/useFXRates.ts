import { useState, useEffect } from 'react';
import { mockFXRates } from '@/services/mockData';

export interface FXRate {
  rate: number;
  change24h: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FXRates {
  [pair: string]: FXRate;
}

export const useFXRates = () => {
  const [rates, setRates] = useState<FXRates>(mockFXRates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, would fetch from price feeds/DEX
      const updatedRates = { ...mockFXRates };
      
      // Simulate rate fluctuations
      Object.keys(updatedRates).forEach(pair => {
        const variance = (Math.random() - 0.5) * 0.02; // ±1% variance
        updatedRates[pair] = {
          ...updatedRates[pair],
          rate: updatedRates[pair].rate * (1 + variance),
          change24h: variance * 100,
          trend: variance > 0.005 ? 'up' : variance < -0.005 ? 'down' : 'stable',
        };
      });
      
      setRates(updatedRates);
    } catch (err) {
      setError('Failed to fetch exchange rates');
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