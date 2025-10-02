import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, DollarSign, TrendingUp } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useToast } from '@/hooks/use-toast';
import { isWalletAvailable } from '@/lib/walletUtils';
import { useBalances } from '@/hooks/useBalances';
import { mockUser } from '@/services/mockData';
import { Badge } from '@/components/ui/badge';

const walletOptions = [
  {
    name: 'Petra',
    id: 'petra' as const,
    icon: '🪙',
    description: 'Official Aptos wallet'
  },
  {
    name: 'Martian',
    id: 'martian' as const,
    icon: '👽',
    description: 'Multi-chain wallet'
  },
  {
    name: 'Pontem',
    id: 'pontem' as const,
    icon: '🌉',
    description: 'Aptos native wallet'
  }
];

const WalletButton = () => {
  const { connect, isConnected, address, disconnect, walletType } = useWalletStore();
  const { balances, totalValue, isLoading } = useBalances();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async (walletType: 'petra' | 'martian' | 'pontem') => {
    setConnecting(walletType);
    try {
      // If the chosen wallet requires a browser extension/provider, ensure it's present
      if (!isWalletAvailable(walletType)) {
        toast({
          title: 'Wallet Not Found',
          description: `Could not find the ${walletType} wallet extension in your browser. Please install it or choose a different wallet.`,
          variant: 'destructive',
        });
        return;
      }
      await connect(walletType);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType} wallet`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${walletType} wallet`,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
    setIsOpen(false);
  };

  if (isConnected && address) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span className="hidden md:inline">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <span className="hidden sm:inline md:hidden">
              ${isLoading ? '...' : totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="sm:hidden">Connected</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Wallet Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* User Profile */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card-glass">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xl">
                {mockUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{mockUser.name}</h3>
                <p className="text-sm text-foreground-muted">{mockUser.email}</p>
              </div>
              <Badge variant={mockUser.kycStatus === 'verified' ? 'default' : 'secondary'}>
                {mockUser.kycStatus === 'verified' ? '✓ Verified' : 'Unverified'}
              </Badge>
            </div>

            {/* Wallet Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Wallet Type</span>
                <span className="font-medium capitalize">{walletType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Address</span>
                <span className="font-mono text-sm">{address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>
            </div>

            {/* Total Balance */}
            <div className="p-4 rounded-lg bg-gradient-accent text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Total Balance</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold">
                ${isLoading ? '...' : totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-sm mt-1 opacity-90">
                <TrendingUp className="w-3 h-3" />
                <span>+12.5% this month</span>
              </div>
            </div>

            {/* Individual Balances */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground-muted">Assets</h4>
              <div className="space-y-2">
                {Object.entries(balances).map(([currency, data]) => (
                  <div key={currency} className="flex items-center justify-between p-3 rounded-lg bg-card-glass hover:bg-card-glass/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {currency.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{currency}</p>
                        <p className="text-xs text-foreground-muted">
                          ≈ ${data.usdValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{data.balance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={handleDisconnect} className="w-full">
              Disconnect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-foreground-muted text-center">
            Choose your preferred Aptos wallet to get started
          </p>
          
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleConnect(wallet.id)}
                disabled={connecting === wallet.id}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-foreground-muted">{wallet.description}</div>
                  </div>
                </div>
                {connecting === wallet.id && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletButton;