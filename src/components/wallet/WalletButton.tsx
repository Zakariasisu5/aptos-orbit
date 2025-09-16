import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

const WalletButton = () => {
  const { connect, isConnected, address, disconnect } = useWalletStore();
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
          <Button variant="outline" size="sm" className="flex">
            <Wallet className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <span className="sm:hidden">Connected</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Connected</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-foreground-muted break-all">
                  {address}
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect} className="w-full">
                Disconnect Wallet
              </Button>
            </div>
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