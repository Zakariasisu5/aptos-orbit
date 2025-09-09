import { useState, useEffect } from 'react';
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

  const processBatch = async (employeeList: PayrollEmployee[]): Promise<PayrollBatch> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const batch: PayrollBatch = {
        id: Date.now().toString(),
        employees: employeeList,
        totalAmount: employeeList.reduce((sum, emp) => sum + emp.amount, 0),
        status: 'processing',
        createdAt: new Date().toISOString(),
      };
      
      setBatches(prev => [batch, ...prev]);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const completedBatch: PayrollBatch = {
        ...batch,
        status: 'completed',
        processedAt: new Date().toISOString(),
      };
      
      setBatches(prev => 
        prev.map(b => b.id === batch.id ? completedBatch : b)
      );
      
      return completedBatch;
    } catch (err) {
      setError('Failed to process payroll batch');
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
    processBatch,
    importFromCSV,
  };
};