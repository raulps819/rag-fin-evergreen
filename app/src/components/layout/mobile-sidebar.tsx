'use client';

import { Conversation } from '@/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppSidebar } from './app-sidebar';

interface MobileSidebarProps {
  conversations?: Conversation[];
  currentConversationId?: string;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileSidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <AppSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewChat={() => {
            onNewChat?.();
            onOpenChange?.(false);
          }}
          onSelectConversation={(id) => {
            onSelectConversation?.(id);
            onOpenChange?.(false);
          }}
          onDeleteConversation={onDeleteConversation}
        />
      </SheetContent>
    </Sheet>
  );
}
