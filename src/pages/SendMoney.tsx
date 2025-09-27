import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpRight, User, DollarSign, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockFXRates } from '@/services/mockData';

// local stub implementation to satisfy missing '@/hooks/useWalletActions' during development
const useWalletActionsStub = (): { sendCoin: (recipient: string, amount: string, coinType: string, opts?: any) => Promise<any> } => {
  return {
    sendCoin: async (_recipient: string, _amount: string, _coinType: string, _opts?: any) => {
      await new Promise((r) => setTimeout(r, 500));
      return { explorer: 'https://explorer.aptoslabs.com/txn/0xMOCKHASH', hash: '0xMOCKHASH' };
    },
  };
};

// safe access to process.env for browser (avoid ReferenceError)
const safeProcessEnv = (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : undefined;
const NETWORK = (safeProcessEnv?.NEXT_PUBLIC_APTOS_NETWORK as 'mainnet' | 'testnet' | 'devnet') ?? 'mainnet';
const explorerHostDefault = NETWORK === 'mainnet' ? 'https://explorer.aptoslabs.com' : 'https://explorer.aptoslabs.com';

// useTransactions import (your project hook)
import { useTransactions } from '@/hooks/useTransactions';

// use the wallet actions hook but guard runtime errors from injected providers
let walletActionsHook: any = useWalletActionsStub();
try {
  // call hook inside try so runtime errors thrown by injected extensions are caught
  // replace the next line with your real import if available:
  // walletActionsHook = useWalletActions();
  walletActionsHook = (require('@/hooks/useWalletActions').useWalletActions ?? require('@/hooks/useWalletActions').default)() as any;
} catch (e) {
  console.warn('useWalletActions threw, using stub', e);
  walletActionsHook = useWalletActionsStub();
}

const SendMoney: React.FC = () => {
  const { toast } = useToast();
  const { sendCoin } = walletActionsHook;

  // adapt to your useTransactions hook shape
  const txHook: any = useTransactions();
  const addTransaction = txHook?.addTransaction ?? (() => {});

  const txList: any[] = txHook?.list ?? txHook?.transactions ?? [];

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastExplorer, setLastExplorer] = useState<string | null>(null);

  const currencies = ['USDC', 'EURC', 'GHS-stable', 'USDT'];

  const currentRate = mockFXRates['APT/USDC']?.rate || 1;
  const fee = Number(amount || 0) * 0.001; // 0.1% fee
  const total = Number(amount || 0) + fee;

  // TODO: replace placeholders with your deployed token module types
  const coinTypeMap: Record<string, string> = {
    USDC: '0xYOUR_DEPLOYED_USDC::USDC::T',
    USDT: '0xYOUR_DEPLOYED_USDT::USDT::T',
    EURC: '0xYOUR_DEPLOYED_EURC::C::T',
    'GHS-stable': '0x1::aptos_coin::AptosCoin'
  };

  const explorerHost = explorerHostDefault;
  const getExplorerUrl = (hash?: string) => hash ? `${explorerHost}/txn/${hash}` : null;

  const handleSend = () => {
    if (!recipient || !amount || Number(amount) <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in a valid recipient and amount",
        variant: "destructive",
      });
      return;
    }

    // basic recipient validation: require hex address starting with 0x
    if (!recipient.startsWith('0x')) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a wallet address starting with 0x.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setIsSending(true);

    try {
      const coinType = coinTypeMap[currency] ?? '0x1::aptos_coin::AptosCoin';
      const amtStr = String(amount).trim();

      const result: any = await sendCoin(recipient, amtStr, coinType, { label: 'Send' });

      // normalize tx hash / explorer url
      const txHash = result?.res?.hash ?? result?.hash ?? result?.transaction_hash ?? result?.transactionHash ?? null;
      const explorerUrl = typeof result?.explorer === 'string'
        ? result.explorer
        : (txHash ? getExplorerUrl(txHash) : null);

      setIsSuccess(true);
      if (explorerUrl) setLastExplorer(explorerUrl);

      toast({
        title: "Transaction submitted",
        description: explorerUrl ? `View on explorer: ${explorerUrl}` : `Sent ${amount} ${currency}`,
      });

      // persist into local transaction history so Recent Activities and Transactions pages show it
      try {
        const txToAdd: any = {
          type: 'send',
          amount: Number(amount) || 0,
          currency,
          fee: Number(fee) || 0,
          status: 'submitted',
          note: `To ${recipient}`,
          // include txHash if available (some backends expect txHash or hash)
          txHash: txHash ?? undefined,
          hash: txHash ?? undefined,
        };
        // cast to any to satisfy differing addTransaction signatures in dev
        addTransaction(txToAdd as any);
      } catch (e) {
        console.warn('addTransaction failed', e);
      }

      setTimeout(() => {
        setShowConfirm(false);
        setIsSuccess(false);
        setRecipient('');
        setAmount('');
      }, 2000);
    } catch (err: any) {
      console.error('send failed', err);
      toast({
        title: "Transaction failed",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">Send Money</h1>
        <p className="text-foreground-muted">Transfer funds globally with low fees</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card variant="glass" className="slide-up">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                <Input
                  id="recipient"
                  placeholder="Wallet address (0x...)"
                  className="pl-10"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {amount && (
              <Card variant="glass" className="bg-card-glass/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Amount</span>
                    <span>{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Fee (0.1%)</span>
                    <span>{fee.toFixed(6)} {currency}</span>
                  </div>
                  <div className="border-t border-border-subtle pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{total.toFixed(6)} {currency}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSend}
              disabled={!recipient || !amount}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Money
            </Button>
          </div>
        </Card>

        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4">Recent Recipients</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', email: 'john@example.com', avatar: '👨‍💼' },
              { name: 'Alice Smith', email: 'alice@example.com', avatar: '👩‍💻' },
              { name: 'Bob Johnson', email: 'bob@example.com', avatar: '👨‍🎨' },
            ].map((contact) => (
              <div
                key={contact.email}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-card-glass/50 transition-colors cursor-pointer"
                onClick={() => setRecipient(contact.email)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-sm">
                    {contact.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-foreground-muted">{contact.email}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-foreground-muted" />
              </div>
            ))}
          </div>
        </Card>

        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {txList.length === 0 && <p className="text-foreground-muted">No recent transactions</p>}
            {txList.map((tx: any) => (
              <div key={String(tx.timestamp ?? '') + (tx.hash ?? '')} className="p-3 rounded-lg hover:bg-card-glass/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{tx.label ?? 'Transaction'}</p>
                    <p className="text-sm text-foreground-muted">{tx.note ?? ''}</p>
                    <p className="text-xs text-foreground-muted">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{tx.status ?? ''}</p>
                    {tx.hash ? (
                      <a href={`${explorerHost}/txn/${tx.hash}`} target="_blank" rel="noreferrer" className="text-sm text-primary">View</a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card-glass backdrop-blur-xl border-border-subtle">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transaction Submitted!</h3>
              <p className="text-foreground-muted">
                {lastExplorer ? (
                  <a href={lastExplorer} target="_blank" rel="noreferrer">View on Aptos Explorer</a>
                ) : 'Your transaction has been submitted.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">To:</span>
                  <span>{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Amount:</span>
                  <span>{amount} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Fee:</span>
                  <span>{fee.toFixed(6)} {currency}</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{total.toFixed(6)} {currency}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)} disabled={isSending}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={confirmSend} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendMoney;