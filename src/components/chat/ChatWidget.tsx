import React, { useState, useRef, useEffect } from 'react';
// Animation imports replaced with CSS animations for better performance
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  RotateCcw 
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useChatAI } from '@/hooks/useChatAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/components/ui/use-toast';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';

const ChatWidget: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isOpen, 
    messages, 
    isTyping, 
    isVoiceEnabled,
    toggleChat, 
    clearMessages,
    toggleVoice 
  } = useChatStore();
  
  const { sendMessage, isLoading } = useChatAI();
  const { toast } = useToast();
  
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    initializeSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    initializeSpeechRecognition();
  }, [initializeSpeechRecognition]);

  useEffect(() => {
    if (transcript && !isListening) {
      setInputMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      if (speechSupported) {
        startListening();
      } else {
        toast({
          title: "Voice not supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
      }
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && isVoiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak assistant messages if voice is enabled
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'assistant' && isVoiceEnabled && !isTyping) {
      speakMessage(lastMessage.content);
    }
  }, [messages, isVoiceEnabled, isTyping]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
          <Button
            onClick={toggleChat}
            className="w-14 h-14 rounded-full glass-card shadow-glow hover:shadow-elevated transition-all duration-300 border-accent/20 bg-gradient-primary hover-scale"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </Button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-fade-in">
          <div className="glass-card-elevated bg-card-glass/95 backdrop-blur-xl border-accent/20 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-primary/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">GlobePayX Assistant</h3>
                    {isTyping && (
                      <p className="text-xs text-foreground-muted">Typing...</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoice}
                    className={`w-8 h-8 p-0 ${isVoiceEnabled ? 'text-accent' : 'text-foreground-muted'}`}
                  >
                    {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8 p-0 text-foreground-muted hover:text-foreground"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="w-8 h-8 p-0 text-foreground-muted hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="w-8 h-8 p-0 text-foreground-muted hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Quick Actions */}
                  <QuickActions onActionClick={handleQuickAction} />

                  {/* Messages */}
                  <ScrollArea className="h-96 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      
                      {isTyping && (
                        <ChatMessage
                          message={{
                            id: 'typing',
                            type: 'assistant',
                            content: '',
                            timestamp: new Date(),
                            isTyping: true,
                          }}
                        />
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border-subtle bg-background-glass/50">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about GlobePayX..."
                          className="pr-12 bg-input/80 border-border-subtle focus:border-accent"
                          disabled={isLoading}
                        />
                        
                        {speechSupported && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleVoiceToggle}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 p-0 ${
                              isListening ? 'text-accent animate-pulse' : 'text-foreground-muted'
                            }`}
                          >
                            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="w-10 h-10 p-0 bg-gradient-accent hover:shadow-glow transition-all duration-300"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isListening && (
                      <p className="text-xs text-accent mt-2 flex items-center animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse mr-2" />
                        Listening... Speak now
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </>
  );
};

export default ChatWidget;