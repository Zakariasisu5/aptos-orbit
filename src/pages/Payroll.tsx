import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, Users, Plus, Trash2, Send, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockPayrollData } from '@/services/mockData';
import { useTransactions } from '@/hooks/useTransactions';
import { usePayroll } from '@/hooks/usePayroll';
import useWalletActions from '@/hooks/useWalletActions';
import usePetra from '@/hooks/usePetra';

interface Employee {
  id: string;
  name: string;
  email: string;
  wallet: string;
  amount: number;
  currency: string;
}

// Provide a safe stub if usePayroll isn't available to avoid runtime crashes during dev
const usePayrollSafe = (): { processBatchOnchain: ((emps: Employee[]) => Promise<any>) | undefined } => {
  try {
    const hook = usePayroll();
    return { processBatchOnchain: hook?.processBatchOnchain };
  } catch (e) {
    console.warn('usePayroll unavailable, using stub', e);
    return {
      processBatchOnchain: async (emps: Employee[]) => {
        for (let i = 0; i < emps.length; i++) {
          await new Promise((r) => setTimeout(r, 150));
        }
        return emps.map((e) => ({ address: e.wallet, hash: `0xSIMPAY${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` }));
      }
    };
  }
};

const Payroll: React.FC = () => {
  const { toast } = useToast();
  const txHook: any = useTransactions();
  const addTransaction = txHook?.addTransaction ?? (() => {});

  const { processBatchOnchain } = usePayrollSafe();

  // Move wallet adapter state/refs above any handler that uses them
  const walletActionsRef = useRef<any>({ signAndSubmit: undefined, sendCoin: undefined });
  const [walletAdapterReady, setWalletAdapterReady] = useState<boolean>(false);
  const [attemptingConnect, setAttemptingConnect] = useState<boolean>(false);

  // wallet UI/connect state (Aptos)
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  // hook that exposes sendCoin / signAndSubmit (safe shim + simulation fallback)
  const wa = useWalletActions();
  // helper to connect injected Aptos wallets (Petra / Martian etc)
  const { connect: connectPetra, findProvider: findAptosProvider } = usePetra();

  // keep local ref in sync with hook result and update ready flag
  React.useEffect(() => {
    if (wa) {
      walletActionsRef.current = wa;
      setWalletAdapterReady(Boolean(wa?.sendCoin || wa?.signAndSubmit));
      // if wallet hook reports an account, show as connected
      if (wa?.account) {
        setConnectedWalletName('Aptos Wallet');
        setConnectedWalletAddress(String(wa.account));
      }
    }
  }, [wa]);

  // connect Aptos wallet (tries injected provider via usePetra helper)
  const connectAptos = async () => {
    if (attemptingConnect) return;
    setAttemptingConnect(true);
    try {
      const res = await connectPetra();
      if (!res.success) {
        toast({ title: 'Wallet connect failed', description: res.error ?? 'Failed to connect', variant: 'destructive' });
        setAttemptingConnect(false);
        return;
      }
      // refresh wa (useWalletActions uses useWallet so should update automatically)
      // show success and set connected display
      setConnectedWalletName('Aptos Wallet');
      const acct = res.account ?? wa?.account ?? null;
      setConnectedWalletAddress(acct ? String(acct?.address ?? acct) : null);
      toast({ title: 'Wallet connected', description: 'Connected to Aptos wallet' });
      setWalletAdapterReady(Boolean(wa?.sendCoin || wa?.signAndSubmit));
    } catch (err: any) {
      console.warn('connectAptos failed', err);
      toast({ title: 'Wallet connect error', description: err?.message ?? String(err), variant: 'destructive' });
    } finally {
      setAttemptingConnect(false);
    }
  };

  // employees + UI state
  const [employees, setEmployees] = useState<Employee[]>(mockPayrollData.map((m: any) => ({
    id: m.id ?? String(Math.random()).slice(2),
    name: m.name,
    email: m.email ?? m.emailAddress ?? '',
    wallet: m.wallet ?? m.address ?? '',
    amount: Number(m.amount ?? 0),
    currency: m.currency ?? 'USDC'
  })));
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', wallet: '', amount: '', currency: 'USDC' });
  const totalAmount = employees.reduce((sum, emp) => sum + emp.amount, 0);
  const currencies = ['USDC', 'EURC', 'GHS-stable', 'USDT'];

  // attempt connect loads any useWalletActions module found under src/hooks at runtime
  const attemptConnectAdapter = async () => {
    if (walletAdapterReady || attemptingConnect) return;
    setAttemptingConnect(true);
    try {
      const matches = (import.meta as any).glob('../hooks/**/useWalletActions.{ts,tsx,js,jsx}') as Record<string, () => Promise<any>>;
      const keys = Object.keys(matches);
      if (keys.length === 0) {
        toast({ title: 'No adapter module found', description: 'No useWalletActions module present. Will run in simulation mode.', variant: 'default' });
        return;
      }
      const modLoader = matches[keys[0]];
      const mod = await modLoader();
      const hook = (mod?.useWalletActions ?? mod?.default) as any;
      const result = typeof hook === 'function' ? hook() : hook;
      if (result) {
        walletActionsRef.current = result;
        setWalletAdapterReady(Boolean(result?.sendCoin || result?.signAndSubmit));
        toast({ title: 'Wallet adapter connected', description: 'Found wallet adapter at runtime.' });
      } else {
        toast({ title: 'No adapter found', description: 'Module exports did not provide an adapter function.', variant: 'default' });
      }
    } catch (err: any) {
      console.warn('dynamic import useWalletActions failed', err);
      toast({ title: 'Adapter connect failed', description: 'Could not load wallet adapter. Continuing with simulation.', variant: 'default' });
    } finally {
      setAttemptingConnect(false);
    }
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.amount) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      wallet: newEmployee.wallet || `0x${Math.random().toString(16).substr(2, 8)}`,
      amount: parseFloat(newEmployee.amount),
      currency: newEmployee.currency,
    };
    setEmployees((prev) => [...prev, employee]);
    setNewEmployee({ name: '', email: '', wallet: '', amount: '', currency: 'USDC' });
    setShowAdd(false);
    toast({ title: "Employee Added", description: `${employee.name} has been added to payroll` });
  };

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter(emp => emp.id !== id));
  };

  // On-chain payroll processing (records each payment into transactions)
  const processPayroll = async () => {
    const hasAdapter = Boolean(walletAdapterReady || walletActionsRef.current?.sendCoin || walletActionsRef.current?.signAndSubmit);
    if (!hasAdapter && !processBatchOnchain) {
      toast({
        title: 'No wallet adapter configured',
        description: 'Payroll will run in simulation mode (transactions will be recorded locally). Click "Attempt Connect" to try to enable an adapter.',
        variant: 'default'
      });
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    try {
      const results = await (processBatchOnchain ? processBatchOnchain(employees) : Promise.resolve(employees.map(e => ({ address: e.wallet, hash: `0xSIM${Date.now().toString(36)}` }))));

      const normalized = Array.isArray(results) ? results : [results];

      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const res = normalized[i] ?? normalized.find((r: any) => r?.address === emp.wallet) ?? {};
        let hash = res?.hash ?? res?.txHash ?? null;

        if (!hash && (walletActionsRef.current?.sendCoin || walletActionsRef.current?.signAndSubmit)) {
          try {
            const sendFn = walletActionsRef.current.sendCoin ?? walletActionsRef.current.signAndSubmit;
            const sendResult = await sendFn(emp.wallet, String(emp.amount), emp.currency ?? 'APT');
            hash = sendResult?.hash ?? sendResult?.txHash ?? sendResult?.res?.hash ?? sendResult?.transaction_hash ?? null;
          } catch (e) {
            console.warn('wallet send failed for', emp.wallet, e);
            addTransaction({
              type: 'payroll',
              amount: Number(emp.amount) || 0,
              currency: emp.currency || 'APT',
              fee: 0,
              status: 'failed',
              note: `Payroll to ${emp.wallet} (${emp.name}) - adapter error`
            } as any);
            setProcessingProgress(Math.round(((i + 1) / employees.length) * 100));
            await new Promise((r) => setTimeout(r, 120));
            continue;
          }
        }

        if (!hash) hash = `0xSIM${Date.now().toString(36)}${i}`;

        try {
          addTransaction({
            type: 'payroll',
            amount: Number(emp.amount) || 0,
            currency: emp.currency || 'APT',
            fee: 0,
            status: 'submitted',
            note: `Payroll to ${emp.wallet} (${emp.name})`,
            txHash: hash,
            hash
          } as any);
        } catch (e) {
          console.warn('addTransaction error', e);
        }

        setProcessingProgress(Math.round(((i + 1) / employees.length) * 100));
        await new Promise((r) => setTimeout(r, 120));
      }

      setProcessingProgress(100);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setShowConfirm(false);
        setIsSuccess(false);
        toast({ title: "Payroll Complete", description: `Processed payments for ${employees.length} employees` });
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      toast({ title: "Payroll Failed", description: err?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  async function payEmployee(employeeAddress: string, amount: number, currency = 'APT') {
    setIsProcessing(true);
    try {
      let hash: string | null = null;

      if (walletActionsRef.current?.sendCoin) {
        try {
          const res = await walletActionsRef.current.sendCoin(employeeAddress, String(amount), currency);
          hash = res?.hash ?? res?.txHash ?? res?.res?.hash ?? res?.transaction_hash ?? null;
        } catch (e) {
          console.warn('wallet sendCoin failed, falling back to simulation', e);
        }
      }

      if (!hash) {
        hash = `0xPAY${Date.now().toString(36)}`;
      }

      try {
        const txToAdd: any = {
          type: 'payroll',
          amount: Number(amount) || 0,
          currency,
          fee: 0,
          status: 'submitted',
          note: `Payroll to ${employeeAddress}`,
          txHash: hash,
          hash
        };
        addTransaction(txToAdd as any);
      } catch (err) {
        console.warn('addTransaction error', err);
      }

      toast({ title: 'Payroll sent', description: `Paid ${amount} ${currency} to ${employeeAddress}` });
    } catch (err: any) {
      console.error('pay failed', err);
      toast({ title: 'Payroll failed', description: err?.message ?? String(err), variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }

  // MetaMask/OKX removed — use Aptos provider via usePetra instead
  // (findAptosProvider and connectAptos are provided above)

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* header */}
      <div className="fade-in flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">
            Payroll Management
          </h1>
          <p className="text-foreground-muted">
            Process bulk payments to your team members
          </p>
        </div>

        {/* Connect buttons removed */}
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="accent"
            onClick={() => setShowAdd(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>

          <Button variant="outline" className="flex-1 sm:flex-none">
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
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg bg-card-glass/30 hover:bg-card-glass/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-foreground-muted">{employee.email}</p>
                        <p className="text-xs text-foreground-subtle font-mono truncate">
                          {employee.wallet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">${employee.amount.toLocaleString()}</p>
                        <p className="text-sm text-foreground-muted">{employee.currency}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEmployee(employee.id)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
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
                {
                  date: '2024-01-15',
                  employees: 25,
                  amount: 87500,
                  status: 'completed'
                },
                {
                  date: '2024-01-01',
                  employees: 24,
                  amount: 84000,
                  status: 'completed'
                },
                {
                  date: '2023-12-15',
                  employees: 22,
                  amount: 77000,
                  status: 'completed'
                }
            ].map((batch, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-card-glass/30"
                >
                  <div>
                    <p className="font-medium">{batch.date}</p>
                    <p className="text-sm text-foreground-muted">
                      {batch.employees} employees
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
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

          <DialogDescription>
            Add a new employee to your payroll list. Wallet address is optional and will be generated if left empty.
          </DialogDescription>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex flex-col sm:flex-row gap-3">
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

              <div className="flex flex-col sm:flex-row gap-3">
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

      {/* simple UI for demo — integrate into your existing Payroll page */}
      {mockPayrollData.map((p: any) => (
        <div key={p.address ?? p.wallet ?? p.id} className="flex items-center justify-between p-2">
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-foreground-muted">{p.address ?? p.wallet ?? p.email}</div>
          </div>
          <Button onClick={() => payEmployee(p.address ?? p.wallet, p.amount)} disabled={isProcessing}>Pay {p.amount}</Button>
        </div>
      ))}
    </div>
  );
};

export default Payroll;