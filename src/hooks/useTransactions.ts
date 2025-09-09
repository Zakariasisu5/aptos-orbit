import { useState, useEffect } from 'react';
import { mockTransactions } from '@/services/mockData';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'payroll';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  timestamp: string;
  txHash: string;
  fee: number;
  fromCurrency?: string;
  toCurrency?: string;
  rate?: number;
  batchSize?: number;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, would fetch from blockchain/API
      setTransactions(mockTransactions);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp' | 'txHash'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 40)}`,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  useEffect(() => {
    refreshTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions,
    addTransaction,
  };
};