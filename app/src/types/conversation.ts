/**
 * Conversation types
 *
 * Types for conversation management
 * Compatible with backend schemas (snake_case from API)
 */

import { MessageResponse, Message, toMessage } from './chat';

/**
 * Backend conversation metadata response
 * Matches: api/app/presentation/schemas/conversation.py::ConversationResponse
 */
export interface ConversationResponse {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Backend conversation detail response (with messages)
 * Matches: api/app/presentation/schemas/conversation.py::ConversationDetailResponse
 */
export interface ConversationDetailResponse {
  id: string;
  created_at: string;
  updated_at: string;
  messages: MessageResponse[];
}

/**
 * Backend conversation list response
 * Matches: api/app/presentation/schemas/conversation.py::ConversationListResponse
 */
export interface ConversationListResponse {
  conversations: ConversationResponse[];
  total: number;
}

/**
 * Frontend conversation metadata (camelCase)
 */
export interface ConversationMetadata {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string; // Generated on frontend from first message
  preview?: string; // First message preview
}

/**
 * Frontend conversation detail (with messages)
 */
export interface ConversationDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  title?: string;
}

/**
 * Convert backend ConversationResponse to frontend ConversationMetadata
 */
export function toConversationMetadata(
  response: ConversationResponse,
  title?: string,
  preview?: string
): ConversationMetadata {
  return {
    id: response.id,
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
    title,
    preview,
  };
}

/**
 * Convert backend ConversationDetailResponse to frontend ConversationDetail
 */
export function toConversationDetail(
  response: ConversationDetailResponse
): ConversationDetail {
  const messages = response.messages.map(toMessage);

  // Generate title from first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  const title = firstUserMessage
    ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    : 'Nueva conversación';

  return {
    id: response.id,
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
    messages,
    title,
  };
}

/**
 * Convert array of backend ConversationResponse to frontend ConversationMetadata
 */
export function toConversationList(
  response: ConversationListResponse
): ConversationMetadata[] {
  return response.conversations.map(conv => toConversationMetadata(conv));
}

/**
 * Generate conversation title from first message
 */
export function generateConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');

  if (!firstUserMessage) {
    return 'Nueva conversación';
  }

  const content = firstUserMessage.content.trim();
  const maxLength = 50;

  if (content.length <= maxLength) {
    return content;
  }

  return content.slice(0, maxLength) + '...';
}

/**
 * Generate conversation preview from first message
 */
export function generateConversationPreview(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');

  if (!firstUserMessage) {
    return '';
  }

  const content = firstUserMessage.content.trim();
  const maxLength = 100;

  if (content.length <= maxLength) {
    return content;
  }

  return content.slice(0, maxLength) + '...';
}