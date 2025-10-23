'use client';

import { ChatContainer } from '@/components/chat';
import { MainLayout } from '@/components/layout';
import { useConversations } from '@/hooks/use-conversations';
import { generateConversationTitle } from '@/types';

export default function Home() {
  const {
    conversations,
    currentConversationId,
    isLoading,
    createNew,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const handleNewChat = async () => {
    const newId = await createNew();
    if (newId) {
      console.log('[Home] New conversation created:', newId);
    }
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Delete failed:', error);
    }
  };

  // Convert ConversationMetadata to Conversation format for sidebar
  const conversationsForSidebar = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title || generateConversationTitle([]),
    messages: [],
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }));

  return (
    <MainLayout
      conversations={conversationsForSidebar}
      currentConversationId={currentConversationId}
      isLoadingConversations={isLoading}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      {/* Chat takes full height */}
      <div className="h-full">
        <ChatContainer
          conversationId={currentConversationId || undefined}
          onConversationChange={(id) => selectConversation(id)}
        />
      </div>
    </MainLayout>
  );
}
