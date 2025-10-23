'use client';

/**
 * MainLayout Component
 *
 * Shared layout with sidebar for all pages
 */

import { useState } from 'react';
import { AppSidebar, MobileSidebar } from '@/components/layout';
import { Conversation } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  conversations?: Conversation[];
  currentConversationId?: string;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export function MainLayout({
  children,
  title = 'Evergreen FinIA',
  subtitle = 'Consulta información sobre tus gastos, ventas, contratos y más',
  conversations = [],
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="border-b bg-background px-3 py-3 md:px-6 md:py-4 flex items-center gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <MobileSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={onNewChat}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
