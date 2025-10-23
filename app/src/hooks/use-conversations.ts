/**
 * useConversations Hook
 *
 * Manages conversation state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { ConversationMetadata } from '@/types';
import {
  listConversations,
  createConversation,
  deleteConversation,
} from '@/services/conversations';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api-client';

const STORAGE_KEY = 'currentConversationId';

interface UseConversationsResult {
  conversations: ConversationMetadata[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  createNew: () => Promise<string | null>;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations from backend
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const convos = await listConversations();
      setConversations(convos);
    } catch (err) {
      console.error('Error loading conversations:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error('Error al cargar conversaciones: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();

    // Load current conversation from localStorage
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      setCurrentConversationId(savedId);
    }
  }, [loadConversations]);

  // Create new conversation
  const createNew = useCallback(async (): Promise<string | null> => {
    try {
      const newConversation = await createConversation();

      // Add to list at the beginning
      setConversations((prev) => [newConversation, ...prev]);

      // Set as current
      setCurrentConversationId(newConversation.id);
      localStorage.setItem(STORAGE_KEY, newConversation.id);

      toast.success('Nueva conversación creada');

      return newConversation.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  // Delete conversation
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);

        // Remove from list
        setConversations((prev) => prev.filter((conv) => conv.id !== id));

        // Clear current if it was deleted
        if (currentConversationId === id) {
          setCurrentConversationId(null);
          localStorage.removeItem(STORAGE_KEY);
        }

        toast.success('Conversación eliminada');
      } catch (err) {
        console.error('Error deleting conversation:', err);
        toast.error(getErrorMessage(err));
        throw err; // Re-throw so caller can handle
      }
    },
    [currentConversationId]
  );

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversationId,
    isLoading,
    error,
    createNew,
    selectConversation,
    deleteConversation: handleDeleteConversation,
    refreshConversations,
  };
}
