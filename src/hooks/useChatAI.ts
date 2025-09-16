import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useBalances } from '@/hooks/useBalances';
import { useTransactions } from '@/hooks/useTransactions';
import { useFXRates } from '@/hooks/useFXRates';
import { useChatStore } from '@/store/chatStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useChatAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, setTyping } = useChatStore();
  const { toast } = useToast();
  
  // Get app state for context
  const walletState = useWalletStore();
  const { balances, totalValue } = useBalances();
  const { transactions } = useTransactions();
  const { rates } = useFXRates();

  const getAppContext = () => {
    return {
      wallet: {
        isConnected: walletState.isConnected,
        address: walletState.address,
        walletType: walletState.walletType,
        balance: walletState.balance,
        network: walletState.network,
      },
      balances: {
        totalValue,
        currencies: Object.keys(balances),
      },
      recentTransactions: transactions.slice(0, 5).map(tx => ({
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        timestamp: tx.timestamp,
      })),
      fxRates: Object.keys(rates).slice(0, 5),
    };
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    setTyping(true);

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
    });

    try {
      const appContext = getAppContext();
      
      let data: any = null;
      try {
        const res = await supabase.functions.invoke('chat-ai', {
          body: JSON.stringify({
            message: userMessage,
            context: appContext,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        // The Supabase Functions client returns { data, error } or throws; normalize
        if (res.error) {
          // include status and message where available
          console.error('Supabase function error object:', res.error);
          throw res.error;
        }

        data = res.data;
      } catch (errAny) {
        // If it's a FunctionsHttpError, it may include status and body
        console.error('Error invoking chat-ai function:', errAny);
        // Try to provide more detail if available
        if (errAny && errAny.status) {
          console.error('Function status:', errAny.status);
        }
        if (errAny && errAny.body) {
          try {
            console.error('Function body:', JSON.stringify(JSON.parse(errAny.body), null, 2));
          } catch {
            console.error('Function body (raw):', errAny.body);
          }
        }
        throw errAny;
      }

      // Add AI response
      addMessage({
        type: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
      });

      // Handle any suggested actions
      if (data.action) {
        handleSuggestedAction(data.action);
      }

    } catch (error) {
      console.error('Chat AI error:', error);

      // Fallback response
      addMessage({
        type: 'assistant',
        content: getErrorResponse(userMessage),
      });

      // More informative toast
      toast({
        /*
        title: "AI Service Unavailable",
        description: "Chat AI is currently unavailable. Check function logs or your OpenAI key. The message has been handled locally.",
        variant: "destructive",
        */
      });
    } finally {
      setIsLoading(false);
      setTyping(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    switch (action) {
      case 'open_send_money':
        window.location.href = '/send';
        break;
      case 'open_receive_money':
        window.location.href = '/receive';
        break;
      case 'open_payroll':
        window.location.href = '/payroll';
        break;
      // forex and treasury navigation removed
      case 'open_transactions':
        window.location.href = '/transactions';
        break;
      case 'open_dashboard':
        window.location.href = '/dashboard';
        break;
    }
  };

  const getErrorResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('wallet') || message.includes('connect')) {
      return "To connect your wallet, click the 'Connect Wallet' button in the top navigation. GlobePayX supports Petra, Martian, and Pontem wallets for the Aptos blockchain.";
    }
    
    if (message.includes('send') || message.includes('transfer')) {
      return "To send money, go to the Send Money page where you can enter recipient details, amount, and currency. The transaction will be processed on the Aptos blockchain.";
    }
    
    if (message.includes('rate') || message.includes('exchange') || message.includes('fx')) {
      return "Currently exchange rate features are unavailable. I can still provide guidance on conversions and expected behavior.";
    }
    
    if (message.includes('payroll')) {
      return "For payroll management, visit the Payroll page where you can upload CSV files with employee data and process batch payments efficiently.";
    }
    
    if (message.includes('transaction') || message.includes('history')) {
      return "Check your transaction history on the Transactions page where you can view all your sends, receives, swaps, and payroll operations.";
    }
    
    return "I'm here to help with GlobePayX! You can ask me about wallet connections, sending money, checking rates, payroll processing, or viewing your transaction history.";
  };

  return {
    sendMessage,
    isLoading,
  };
};