import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpRight, User, DollarSign, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFXRates } from '@/hooks/useFXRates';

const SendMoney = () => {
  const { toast } = useToast();
  const { rates } = useFXRates();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currencies = ['USDC', 'EURC', 'GHS-stable', 'USDT'];
  
  const currentRate = rates['APT/USDC']?.rate || 1;
  const fee = parseFloat(amount) * 0.001; // 0.1% fee
  const total = parseFloat(amount) + fee;

  const handleSend = () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setIsSending(true);
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSending(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setShowConfirm(false);
      setIsSuccess(false);
      setRecipient('');
      setAmount('');
      toast({
        title: "Transaction Successful",
        description: `Sent ${amount} ${currency} to ${recipient}`,
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Send Money
        </h1>
        <p className="text-foreground-muted">
          Transfer funds globally with low fees
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Send Form */}
        <Card variant="glass" className="slide-up">
          <div className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-foreground-muted" />
                <Input
                  id="recipient"
                  placeholder="Email or wallet address"
                  className="pl-10"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </div>

            {/* Amount and Currency */}
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
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* FX Preview */}
            {amount && (
              <Card variant="glass" className="bg-card-glass/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Amount</span>
                    <span>{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Fee (0.1%)</span>
                    <span>{fee.toFixed(2)} {currency}</span>
                  </div>
                  <div className="border-t border-border-subtle pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{total.toFixed(2)} {currency}</span>
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

        {/* Recent Recipients */}
        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4">Recent Recipients</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', email: 'john@example.com', avatar: '👨‍💼' },
              { name: 'Alice Smith', email: 'alice@example.com', avatar: '👩‍💻' },
              { name: 'Bob Johnson', email: 'bob@example.com', avatar: '👨‍🎨' },
            ].map((contact, index) => (
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
      </div>

      {/* Confirmation Modal */}
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
              <h3 className="text-xl font-semibold mb-2">Transaction Successful!</h3>
              <p className="text-foreground-muted">
                Your money has been sent successfully
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
                  <span>{fee.toFixed(2)} {currency}</span>
                </div>
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={confirmSend}
                  disabled={isSending}
                >
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