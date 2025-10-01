import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { getTransactionHistory } from '@/services/aptosService';

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
  const { address, isConnected } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = async () => {
    if (!address || !isConnected) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedTransactions = await getTransactionHistory(address);
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError('Failed to fetch transactions from blockchain');
      console.error(err);
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
  }, [address, isConnected]);

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions,
    addTransaction,
  };
};