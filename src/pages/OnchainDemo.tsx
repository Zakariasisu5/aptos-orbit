import React from 'react';
import { Button } from '@/components/ui/button';
import useContract from '@/hooks/useContract';
import { useWalletStore } from '@/store/walletStore';
import { useToast } from '@/hooks/use-toast';
import { isWalletAvailable } from '@/lib/walletUtils';

const ProviderPanel: React.FC = () => {
  // detect common injected providers (prefer standardized `window.aptos` to avoid vendor inpage logs)
  // @ts-ignore
  const win: any = typeof window !== 'undefined' ? window : {};
  const providers = [
    { name: 'aptos', obj: win.aptos },
    { name: 'petra', obj: isWalletAvailable('petra') ? win.aptos : undefined },
    { name: 'martian', obj: isWalletAvailable('martian') ? win.martian : undefined },
    { name: 'pontem', obj: isWalletAvailable('pontem') ? win.pontem : undefined },
    { name: 'ethereum', obj: win.ethereum },
  ];

  return (
    <div className="text-sm">
      {providers.map((p) => (
        <div key={p.name} className="flex items-center space-x-2">
          <div className="font-medium w-24">{p.name}:</div>
          <div>
            {p.obj ? (
              <span>
                present {p.obj.isMetaMask ? '(MetaMask)' : ''} {p.obj.isAptos ? '(Aptos)' : ''}
              </span>
            ) : (
              <span className="text-muted-foreground">not present</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const OnchainDemo: React.FC = () => {
  const { readResource, submitWithWallet } = useContract();
  const wallet = useWalletStore();

  const handleRead = async () => {
    try {
      const address = wallet.address || '0x1';
      const res = await readResource(address, '0x1::Account::Account');
  console.log('Resource:', res);
  toast({ title: 'Resource fetched', description: 'Check console for details.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Read failed', description: 'Failed to read resource: ' + (e?.message || String(e)), variant: 'destructive' });
    }
  };

  const handleSend = async () => {
    try {
      // Example placeholder payload - replace with a real Move transaction payload for your module
      const payload = {
        type: 'entry_function_payload',
        function: '0x1::Coin::transfer',
        arguments: ['0x1', 1],
        type_arguments: ['0x1::Coin::Coin'],
      };

      const res = await submitWithWallet({ signedTxn: payload });
  console.log('Submit result:', res);
  toast({ title: 'Submitted', description: 'Transaction submitted - check console.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Submit failed', description: 'Failed to submit: ' + (e?.message || String(e)), variant: 'destructive' });
    }
  };

  const handleConnect = async (type: 'petra' | 'martian' | 'pontem' | null) => {
    try {
      // If a concrete wallet type was chosen, ensure it's available before calling into the store
      if (type && !isWalletAvailable(type)) {
        toast({ title: 'Wallet Not Found', description: `Could not find ${type} extension in your browser. Please install it or choose a different wallet.`, variant: 'destructive' });
        return;
      }
      await wallet.connect(type as any);
  toast({ title: 'Connected', description: `Connected: ${wallet.address}` });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Connect failed', description: (e?.message || String(e)), variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">On-chain demo</h2>
      <div className="mb-4 p-3 border rounded">
        <h3 className="font-semibold">Detected providers</h3>
        <ProviderPanel />
      </div>
      <div className="space-y-2">
        <div>Wallet: {wallet.isConnected ? wallet.address : 'Not connected'}</div>
        <div className="flex space-x-2">
          <Button onClick={() => handleConnect('petra')} disabled={!isWalletAvailable('petra')}>Connect Petra</Button>
          <Button onClick={() => handleConnect('martian')} disabled={!isWalletAvailable('martian')}>Connect Martian</Button>
          <Button onClick={() => handleConnect('pontem')} disabled={!isWalletAvailable('pontem')}>Connect Pontem</Button>
          <Button onClick={() => handleConnect(null)}>Auto-detect</Button>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={handleRead}>Read Account Resource</Button>
          <Button onClick={handleSend}>Submit Example Tx</Button>
        </div>
      </div>
    </div>
  );
};

function toast(opts: { title: string; description?: string; variant?: 'destructive' | 'default' } = { title: '' }) : void {
  // Fallback lightweight browser toast for environments where the app-level toast isn't available.
  try {
    // Log for developers / non-browser envs
    console.info('toast:', opts.title, opts.description ?? '', opts.variant ?? 'default');

    if (typeof document === 'undefined') return;

    const containerId = 'fallback-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      Object.assign(container.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      });
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.textContent = opts.title + (opts.description ? ` — ${opts.description}` : '');
    Object.assign(toastEl.style, {
      pointerEvents: 'auto',
      maxWidth: '360px',
      padding: '10px 14px',
      borderRadius: '8px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      fontSize: '13px',
      lineHeight: '1.2',
      background: opts.variant === 'destructive' ? '#fee2e2' : '#e6f7ff',
      color: '#0f172a',
      opacity: '1',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    });

    container.appendChild(toastEl);

    // Auto-dismiss
    const life = opts.variant === 'destructive' ? 6000 : 4000;
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-6px)';
      setTimeout(() => toastEl.remove(), 300);
    }, life);
  } catch (e) {
    // Ensure toast never throws
    console.warn('Fallback toast failed:', e);
  }
}

