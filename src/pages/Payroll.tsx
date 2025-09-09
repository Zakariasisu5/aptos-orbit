import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, Users, Plus, Trash2, Send, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockPayrollData } from '@/services/mockData';

interface Employee {
  id: string;
  name: string;
  email: string;
  wallet: string;
  amount: number;
  currency: string;
}

const Payroll = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockPayrollData);
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    wallet: '',
    amount: '',
    currency: 'USDC'
  });

  const totalAmount = employees.reduce((sum, emp) => sum + emp.amount, 0);
  const currencies = ['USDC', 'EURC', 'GHS-stable', 'USDT'];

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      wallet: newEmployee.wallet || `0x${Math.random().toString(16).substr(2, 8)}...`,
      amount: parseFloat(newEmployee.amount),
      currency: newEmployee.currency,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', wallet: '', amount: '', currency: 'USDC' });
    setShowAdd(false);
    
    toast({
      title: "Employee Added",
      description: `${employee.name} has been added to payroll`,
    });
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const processPayroll = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate batch processing
    for (let i = 0; i <= employees.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress((i / employees.length) * 100);
    }

    setIsProcessing(false);
    setIsSuccess(true);

    setTimeout(() => {
      setShowConfirm(false);
      setIsSuccess(false);
      toast({
        title: "Payroll Complete",
        description: `Successfully sent payments to ${employees.length} employees`,
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Payroll Management
        </h1>
        <p className="text-foreground-muted">
          Process bulk payments to your team members
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <Card variant="glass" className="slide-up">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold">{employees.length}</p>
              <p className="text-sm text-foreground-muted">Employees</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">$</span>
              </div>
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
              <p className="text-sm text-foreground-muted">Total Amount</p>
            </div>
            <div className="text-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowConfirm(true)}
                disabled={employees.length === 0}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="accent" 
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </div>

        {/* Employee List */}
        <Card variant="glass" className="slide-up">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Employee List</h3>
            
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No employees added</h3>
                <p className="text-foreground-muted mb-4">
                  Add employees to process payroll
                </p>
                <Button variant="accent" onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee, index) => (
                  <div 
                    key={employee.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-card-glass/30 hover:bg-card-glass/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-foreground-muted">{employee.email}</p>
                        <p className="text-xs text-foreground-subtle font-mono">
                          {employee.wallet}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">${employee.amount.toLocaleString()}</p>
                        <p className="text-sm text-foreground-muted">{employee.currency}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEmployee(employee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Payroll History */}
        <Card variant="glass" className="slide-up">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Payroll History</h3>
            
            <div className="space-y-3">
              {[
                { date: '2024-01-15', employees: 25, amount: 87500, status: 'completed' },
                { date: '2024-01-01', employees: 24, amount: 84000, status: 'completed' },
                { date: '2023-12-15', employees: 22, amount: 77000, status: 'completed' },
              ].map((batch, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-glass/30"
                >
                  <div>
                    <p className="font-medium">{batch.date}</p>
                    <p className="text-sm text-foreground-muted">
                      {batch.employees} employees
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${batch.amount.toLocaleString()}</p>
                    <p className="text-sm text-success capitalize">{batch.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Employee Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card-glass backdrop-blur-xl border-border-subtle">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address (Optional)</Label>
              <Input
                id="wallet"
                placeholder="Will generate if empty"
                value={newEmployee.wallet}
                onChange={(e) => setNewEmployee({ ...newEmployee, wallet: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newEmployee.amount}
                  onChange={(e) => setNewEmployee({ ...newEmployee, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={newEmployee.currency} 
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={addEmployee}
              >
                Add Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Payroll Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card-glass backdrop-blur-xl border-border-subtle">
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
          </DialogHeader>
          
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payroll Complete!</h3>
              <p className="text-foreground-muted">
                All payments have been processed successfully
              </p>
            </div>
          ) : isProcessing ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-accent animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold">Processing Payroll...</h3>
              <div className="space-y-2">
                <Progress value={processingProgress} className="w-full" />
                <p className="text-sm text-foreground-muted">
                  {Math.round(processingProgress)}% complete
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Employees:</span>
                  <span>{employees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Total Amount:</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Network Fee:</span>
                  <span>${(employees.length * 0.5).toFixed(2)}</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Cost:</span>
                    <span>${(totalAmount + employees.length * 0.5).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={processPayroll}
                >
                  Process Payments
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;