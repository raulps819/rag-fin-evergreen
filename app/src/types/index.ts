// Chat types
export type {
  Message,
  MessageRole,
  MessageStatus,
  Conversation,
  SuggestedQuestion,
  ChatInputState,
  ChatState,
  DocumentReference,
  ChartData,
  TableData,
  // Backend types
  DocumentSource,
  ChatRequest,
  ChatResponse,
  MessageResponse,
} from './chat';

export {
  toMessage,
  chatResponseToMessage,
} from './chat';

// User types
export type {
  User,
  UserPreferences,
} from './user';

// Document types
export type {
  Document,
  DocumentUploadResponse,
  DocumentListResponse,
  DocumentUploadOptions,
  DocumentUploadMultipleOptions,
  UploadResult,
  BatchUploadResults,
  SupportedDocumentType,
} from './document';

export {
  toDocument,
  toDocuments,
  isSupportedDocumentType,
  getFileExtension,
  SUPPORTED_DOCUMENT_TYPES,
} from './document';

// Conversation types
export type {
  ConversationMetadata,
  ConversationDetail,
  ConversationResponse,
  ConversationDetailResponse,
  ConversationListResponse,
} from './conversation';

export {
  toConversationMetadata,
  toConversationDetail,
  toConversationList,
  generateConversationTitle,
  generateConversationPreview,
} from './conversation';
