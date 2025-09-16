import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  // persisted state may serialize Dates to strings, so allow multiple types here
  timestamp: Date | string | number;
  isTyping?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  action?: () => void;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  isVoiceEnabled: boolean;
  isListening: boolean;
  quickActions: QuickAction[];
}

interface ChatActions {
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
  toggleVoice: () => void;
  setListening: (isListening: boolean) => void;
  updateQuickActions: (actions: QuickAction[]) => void;
}

type ChatStore = ChatState & ChatActions;

const defaultQuickActions: QuickAction[] = [
  {
    id: 'connect-wallet',
    label: 'Connect Wallet',
    icon: '🔗',
    prompt: 'Help me connect my wallet to GlobePayX'
  },
  {
    id: 'send-money',
    label: 'Send Money',
    icon: '💸',
    prompt: 'I want to send money to someone'
  },
  
  {
    id: 'payroll-help',
    label: 'Payroll Help',
    icon: '📊',
    prompt: 'How do I upload and process payroll?'
  },
  {
    id: 'view-transactions',
    label: 'My Transactions',
    icon: '📋',
    prompt: 'Show me my recent transactions'
  },
  
];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: 'Hey there! 👋 I\'m your GlobePayX assistant. I can help you with wallet connections, sending money, payroll, and much more. What can I help you with today?',
          timestamp: new Date(),
        }
      ],
      isOpen: false,
      isTyping: false,
      isVoiceEnabled: false,
      isListening: false,
      quickActions: defaultQuickActions,

      // Actions
      toggleChat: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      setTyping: (isTyping) => {
        set({ isTyping });
      },

      clearMessages: () => {
        set({
          messages: [
            {
              id: '1',
              type: 'assistant',
              content: 'Hey there! 👋 I\'m your GlobePayX assistant. How can I help you today?',
              timestamp: new Date(),
            }
          ]
        });
      },

      toggleVoice: () => {
        set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled }));
      },

      setListening: (isListening) => {
        set({ isListening });
      },

      updateQuickActions: (actions) => {
        set({ quickActions: actions });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        isVoiceEnabled: state.isVoiceEnabled,
      }),
    }
  )
);