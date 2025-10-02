import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, QrCode, Check, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockUser } from '@/services/mockData';

const ReceiveMoney = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');

  const walletAddress = mockUser.wallet;
  const paymentLink = `https://globepay.vercel.app/pay/${walletAddress}${amount ? `?amount=${amount}` : ''}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePaymentLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GlobePayX Payment Request',
        text: `Send me money via GlobePayX`,
        url: paymentLink,
      });
    } else {
      copyToClipboard(paymentLink, 'Payment link');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold font-display mb-2">
          Receive Money
        </h1>
        <p className="text-foreground-muted">
          Share your wallet address or payment link to receive funds
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Wallet Address */}
        <Card variant="glass" className="slide-up">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Your Wallet Address</h3>
              <p className="text-foreground-muted text-sm">
                Share this address to receive payments
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="w-48 h-48 mx-auto bg-gradient-surface rounded-xl flex items-center justify-center border border-border-subtle">
              <div className="text-center space-y-2">
                <QrCode className="w-16 h-16 text-foreground-muted mx-auto" />
                <p className="text-sm text-foreground-muted">QR Code</p>
                <p className="text-xs text-foreground-subtle px-4">
                  Scan to send money to this wallet
                </p>
              </div>
            </div>

            {/* Address Display */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-card-glass/50 rounded-lg p-3">
                <code className="flex-1 text-sm font-mono break-all">
                  {walletAddress}
                </code>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <Button
                variant="accent"
                className="w-full"
                onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Link Generator */}
        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Request Specific Amount</h3>
              <p className="text-foreground-muted text-sm">
                Generate a payment link with a specific amount
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-card-glass/50 rounded-lg p-3">
                  <span className="flex-1 text-sm break-all">
                    {paymentLink}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyToClipboard(paymentLink, 'Payment link')}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(paymentLink, 'Payment link')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="accent"
                    onClick={sharePaymentLink}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card variant="glass" className="slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Recent Incoming Payments</h3>
            
            <div className="space-y-3">
              {[
                { from: 'Alice Smith', amount: 1200, currency: 'USDC', time: '2 hours ago' },
                { from: 'John Doe', amount: 500, currency: 'USDT', time: '1 day ago' },
                { from: 'Bob Johnson', amount: 750, currency: 'EURC', time: '3 days ago' },
              ].map((payment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-glass/30 hover:bg-card-glass/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                      <span className="text-xs">+</span>
                    </div>
                    <div>
                      <p className="font-medium">{payment.from}</p>
                      <p className="text-sm text-foreground-muted">{payment.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">
                      +${payment.amount}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {payment.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReceiveMoney;
