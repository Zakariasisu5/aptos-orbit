import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/store/chatStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-card-glass px-1 py-0.5 rounded text-accent">$1</code>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-accent' 
          : 'bg-gradient-primary'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-accent text-white rounded-br-md' 
            : 'bg-card-glass border border-border-subtle rounded-bl-md'
        }`}>
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <div 
              className={`text-sm leading-relaxed ${
                isUser ? 'text-white' : 'text-foreground'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: formatMessage(message.content) 
              }}
            />
          )}
        </div>
        
        {/* Timestamp */}
        {!message.isTyping && (
          <div className={`text-xs text-foreground-subtle mt-1 px-2 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;