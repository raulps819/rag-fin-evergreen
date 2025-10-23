/**
 * Services barrel export
 *
 * Centralized exports for all API services
 */

// Health service
export { checkHealth, isBackendAvailable } from './health';

// Documents service
export {
  uploadDocument,
  uploadDocuments,
  listDocuments,
  deleteDocument,
  getDocument,
} from './documents';

// Chat service
export {
  sendMessage,
  streamMessage,
  validateMessageContent,
  type SendMessageResult,
} from './chat';

// Conversations service
export {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  ensureConversation,
  listConversationsWithTitles,
} from './conversations';