import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { buildBatchPayPayload } from '@/integrations/aptos/tx';
import { mockPayrollData } from '@/services/mockData';

export interface PayrollEmployee {
  id: string;
  name: string;
  email: string;
  wallet: string;
  amount: number;
  currency: string;
  status?: string;
}

export interface PayrollBatch {
  id: string;
  employees: PayrollEmployee[];
  totalAmount: number;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

export const usePayroll = () => {
  const [employees, setEmployees] = useState<PayrollEmployee[]>(mockPayrollData);
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, signAndSubmit } = useWalletStore();

  const addEmployee = (employee: Omit<PayrollEmployee, 'id'>) => {
    const newEmployee: PayrollEmployee = {
      ...employee,
      id: Date.now().toString(),
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  };

  const removeEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id: string, updates: Partial<PayrollEmployee>) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  };

  // On-chain payroll batch processing
  const processBatchOnchain = async (employeeList: PayrollEmployee[], memo = 'Payroll batch') => {
    setIsLoading(true);
    setError(null);
    try {
      if (!address || !signAndSubmit) throw new Error('Wallet not connected');
      const recipients = employeeList.map(emp => emp.wallet);
      const amounts = employeeList.map(emp => emp.amount);
      // TODO: support multiple coin types if needed
      const payload = buildBatchPayPayload(address, recipients, amounts, memo);
      const txResult = await signAndSubmit(payload);
      const batch: PayrollBatch = {
        id: Date.now().toString(),
        employees: employeeList,
        totalAmount: employeeList.reduce((sum, emp) => sum + emp.amount, 0),
        status: 'completed',
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };
      setBatches(prev => [batch, ...prev]);
      return batch;
    } catch (err: any) {
      setError('Failed to process payroll batch: ' + (err?.message || 'Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const importFromCSV = (csvData: string): PayrollEmployee[] => {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',');
      
      const imported = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        
        return {
          id: `imported-${Date.now()}-${index}`,
          name: values[headers.indexOf('name')] || '',
          email: values[headers.indexOf('email')] || '',
          wallet: values[headers.indexOf('wallet')] || `0x${Math.random().toString(16).substr(2, 8)}...`,
          amount: parseFloat(values[headers.indexOf('amount')] || '0'),
          currency: values[headers.indexOf('currency')] || 'USDC',
        };
      });
      
      setEmployees(prev => [...prev, ...imported]);
      return imported;
    } catch (err) {
      setError('Failed to import CSV data');
      return [];
    }
  };

  useEffect(() => {
    // Load saved data from localStorage or API
    const savedEmployees = localStorage.getItem('payroll-employees');
    if (savedEmployees) {
      try {
        setEmployees(JSON.parse(savedEmployees));
      } catch {
        // Fallback to mock data
        setEmployees(mockPayrollData);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever employees change
    localStorage.setItem('payroll-employees', JSON.stringify(employees));
  }, [employees]);

  const totalAmount = employees.reduce((sum, emp) => sum + emp.amount, 0);

  return {
    employees,
    batches,
    totalAmount,
    isLoading,
    error,
    addEmployee,
    removeEmployee,
    updateEmployee,
    processBatchOnchain,
    importFromCSV,
  };
};