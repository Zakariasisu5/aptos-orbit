import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/GlassCard';
import { Wallet } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useToast } from '@/hooks/use-toast';
import { isWalletAvailable } from '@/lib/walletUtils';

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

const WalletConnect = () => {
  const { connect, isConnected, address, disconnect } = useWalletStore();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (walletType: 'petra' | 'martian' | 'pontem') => {
    setConnecting(walletType);
    try {
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
  };

  if (isConnected && address) {
    return (
      <Card variant="glass" className="slide-up">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Wallet Connected</h3>
            <p className="text-sm text-foreground-muted break-all">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <Button variant="outline" onClick={handleDisconnect} className="w-full">
            Disconnect Wallet
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="slide-up">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-foreground-muted">
            Choose your preferred Aptos wallet to get started
          </p>
        </div>
        
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
    </Card>
  );
};

export default WalletConnect;