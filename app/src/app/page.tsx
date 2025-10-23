'use client';

import { useState } from 'react';
import { ChatContainer } from '@/components/chat';
import { MainLayout } from '@/components/layout';
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
    <MainLayout
      conversations={conversations}
      currentConversationId={currentConversationId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      {/* Chat takes full height */}
      <div className="h-full">
        <ChatContainer />
      </div>
    </MainLayout>
  );
}
