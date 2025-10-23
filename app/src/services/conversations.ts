/**
 * Conversations Service
 *
 * Handles conversation management
 * Endpoints: POST /conversations, GET /conversations, GET /conversations/{id}, DELETE /conversations/{id}
 */

import { api, ApiError } from '@/lib/api-client';
import {
  ConversationMetadata,
  ConversationDetail,
  ConversationResponse,
  ConversationDetailResponse,
  ConversationListResponse,
  toConversationMetadata,
  toConversationDetail,
  toConversationList,
  generateConversationTitle,
  generateConversationPreview,
} from '@/types';

/**
 * Create a new conversation
 *
 * @returns New conversation metadata
 * @throws ApiError if request fails
 */
export async function createConversation(): Promise<ConversationMetadata> {
  try {
    const response = await api.post<ConversationResponse>('/conversations');
    return toConversationMetadata(response, 'Nueva conversación');
  } catch (error) {
    if (error instanceof ApiError && error.status === 500) {
      throw new Error('Error al crear la conversación');
    }
    throw error;
  }
}

/**
 * List all conversations (without messages)
 * Ordered by updated_at DESC
 *
 * @returns Array of conversation metadata
 * @throws ApiError if request fails
 */
export async function listConversations(): Promise<ConversationMetadata[]> {
  try {
    const response = await api.get<ConversationListResponse>('/conversations');
    const conversations = toConversationList(response);

    // Sort by updatedAt DESC (most recent first)
    return conversations.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 500) {
      throw new Error('Error al obtener las conversaciones');
    }
    throw error;
  }
}

/**
 * Get a conversation by ID with all messages
 *
 * @param conversationId - Conversation ID
 * @returns Conversation detail with messages
 * @throws ApiError if request fails or conversation not found
 */
export async function getConversation(
  conversationId: string
): Promise<ConversationDetail> {
  if (!conversationId) {
    throw new Error('ID de conversación requerido');
  }

  try {
    const response = await api.get<ConversationDetailResponse>(
      `/conversations/${conversationId}`
    );

    return toConversationDetail(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      if (error.status === 500) {
        throw new Error('Error al obtener la conversación');
      }
    }
    throw error;
  }
}

/**
 * Delete a conversation and all its messages
 *
 * @param conversationId - Conversation ID to delete
 * @throws ApiError if request fails or conversation not found
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (!conversationId) {
    throw new Error('ID de conversación requerido');
  }

  try {
    await api.delete(`/conversations/${conversationId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      if (error.status === 500) {
        throw new Error('Error al eliminar la conversación');
      }
    }
    throw error;
  }
}

/**
 * Get or create a conversation
 * Useful for ensuring a conversation exists before sending a message
 *
 * @param conversationId - Optional existing conversation ID
 * @returns Conversation ID (existing or newly created)
 */
export async function ensureConversation(
  conversationId?: string
): Promise<string> {
  if (conversationId) {
    // Verify conversation exists
    try {
      await getConversation(conversationId);
      return conversationId;
    } catch (error) {
      // If not found, create new one
      console.warn('Conversation not found, creating new one');
    }
  }

  // Create new conversation
  const newConversation = await createConversation();
  return newConversation.id;
}

/**
 * List conversations with title and preview generated from messages
 * This fetches each conversation's messages to generate meaningful titles
 * Note: This can be slow if there are many conversations
 *
 * @param limit - Maximum number of conversations to fetch (default: 20)
 * @returns Array of conversation metadata with titles and previews
 */
export async function listConversationsWithTitles(
  limit: number = 20
): Promise<ConversationMetadata[]> {
  const conversations = await listConversations();

  // Take only the most recent conversations
  const recent = conversations.slice(0, limit);

  // Fetch details for each to generate title and preview
  const withTitles = await Promise.all(
    recent.map(async (conv) => {
      try {
        const detail = await getConversation(conv.id);
        return toConversationMetadata(
          {
            id: conv.id,
            created_at: conv.createdAt.toISOString(),
            updated_at: conv.updatedAt.toISOString(),
          },
          generateConversationTitle(detail.messages),
          generateConversationPreview(detail.messages)
        );
      } catch (error) {
        // If fetch fails, return original without title/preview
        console.error('Failed to fetch conversation details:', error);
        return conv;
      }
    })
  );

  return withTitles;
}