'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { DocumentUpload } from '@/components/settings/document-upload';
import { DocumentList } from '@/components/settings/document-list';
import { useConversations } from '@/hooks/use-conversations';
import { generateConversationTitle } from '@/types';

export default function SettingsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const {
    conversations,
    currentConversationId,
    createNew,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const handleUploadComplete = () => {
    // Trigger refresh of document list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNewChat = async () => {
    // Create new conversation
    const newId = await createNew();
    if (newId) {
      // Navigate to home page (chat interface)
      router.push('/');
    }
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    // Navigate to home page to view the conversation
    router.push('/');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
    } catch (error) {
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
      title="Configuración"
      subtitle="Gestiona los documentos de la base de conocimiento y preferencias"
      conversations={conversationsForSidebar}
      currentConversationId={currentConversationId || undefined}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      <div className="container max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Base de Conocimiento
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Sube documentos financieros (PDF, CSV, Excel) para que el asistente pueda consultarlos y responder tus preguntas.
          </p>
        </div>

        {/* Upload Section */}
        <section className="space-y-4">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </section>

        {/* Documents List Section */}
        <section className="space-y-4">
          <DocumentList key={refreshTrigger} />
        </section>

        {/* Future: Preferences Section */}
        {/* <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Preferencias</h2>
            <p className="text-sm text-muted-foreground">
              Configura el comportamiento del asistente.
            </p>
          </div>
        </section> */}
      </div>
    </MainLayout>
  );
}