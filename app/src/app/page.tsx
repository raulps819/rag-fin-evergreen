'use client';

import { useState } from 'react';
import { ChatContainer } from '@/components/chat';
import { AppSidebar, MobileSidebar } from '@/components/layout';
import { Conversation } from '@/types';

// Mock conversations for demonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: '¿Cuánto gasté en fertilizantes?',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Mejores proveedores de semillas',
    messages: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '3',
    title: 'Resumen de ventas del trimestre',
    messages: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewChat = () => {
    // Create a new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    // TODO: Load conversation messages
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(undefined);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="border-b bg-background px-3 py-3 md:px-6 md:py-4 flex items-center gap-3">
          {/* Mobile Menu Button */}
          <MobileSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold truncate">Evergreen FinIA</h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Consulta información sobre tus gastos, ventas, contratos y más
            </p>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
}
