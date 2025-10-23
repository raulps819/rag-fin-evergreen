/**
 * Chat Service
 *
 * Handles chat messages and RAG responses
 * Endpoint: POST /chat/message
 */

import { api, ApiError } from '@/lib/api-client';
import {
  Message,
  ChatRequest,
  ChatResponse,
  chatResponseToMessage,
} from '@/types';

/**
 * Result of sending a chat message
 */
export interface SendMessageResult {
  message: Message;
  conversationId: string;
}

/**
 * Send a message and get RAG response
 *
 * @param content - User message content
 * @param conversationId - Optional conversation ID (creates new if not provided)
 * @returns Assistant message and conversation ID
 * @throws ApiError if request fails
 */
export async function sendMessage(
  content: string,
  conversationId?: string
): Promise<SendMessageResult> {
  if (!content.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }

  if (content.length > 2000) {
    throw new Error('El mensaje es demasiado largo (máximo 2000 caracteres)');
  }

  const request: ChatRequest = {
    message: content.trim(),
    conversation_id: conversationId,
  };

  try {
    const response = await api.post<ChatResponse>('/chat/message', request);

    const message = chatResponseToMessage(response);

    return {
      message,
      conversationId: response.conversation_id,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        throw new Error(
          error.message || 'Mensaje inválido. Verifica el contenido.'
        );
      }
      if (error.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      if (error.status === 500) {
        throw new Error(
          'Error al procesar el mensaje. Por favor, intenta nuevamente.'
        );
      }
    }
    throw error;
  }
}

/**
 * Stream a message response (for future HU5 implementation)
 *
 * @param _content - User message content
 * @param _conversationId - Optional conversation ID
 * @returns AsyncGenerator yielding response chunks
 */
export async function* streamMessage(
  _content: string,
  _conversationId?: string
): AsyncGenerator<string, void, unknown> {
  // Placeholder for HU5 (Streaming SSE)
  // Will use EventSource or fetch with ReadableStream

  // For now, throw not implemented
  throw new Error('Streaming not yet implemented (HU5)');

  // Future implementation:
  // const eventSource = new EventSource(`/chat/stream?message=${encodeURIComponent(_content)}`);
  // ...yield chunks...
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content.trim()) {
    return { valid: false, error: 'El mensaje no puede estar vacío' };
  }

  if (content.length > 2000) {
    return {
      valid: false,
      error: 'El mensaje es demasiado largo (máximo 2000 caracteres)',
    };
  }

  return { valid: true };
}