import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const { quickActions } = useChatStore();

  return (
    <div className="border-b border-border-subtle bg-background-glass/30 p-3">
      <h4 className="text-xs font-medium text-foreground-muted mb-2 uppercase tracking-wide">
        Quick Actions
      </h4>
      
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (action.action) {
                    action.action();
                  } else {
                    onActionClick(action.prompt);
                  }
                }}
                className="flex-shrink-0 bg-card-glass/50 border-border-subtle hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 text-xs"
              >
                <span className="mr-1">{action.icon}</span>
                {action.label}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuickActions;