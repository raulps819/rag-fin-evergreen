export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error' | 'streaming';

/**
 * Backend source schema
 * Matches: api/app/presentation/schemas/chat.py::SourceSchema
 */
export interface DocumentSource {
  document_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  relevance_score?: number;
}

/**
 * Backend chat request
 * Matches: api/app/presentation/schemas/chat.py::ChatRequest
 */
export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

/**
 * Backend chat response
 * Matches: api/app/presentation/schemas/chat.py::ChatResponse
 */
export interface ChatResponse {
  answer: string;
  conversation_id: string;
  sources?: DocumentSource[];
  created_at: string; // ISO datetime
}

/**
 * Backend message response (used in conversation history)
 * Matches: api/app/presentation/schemas/chat.py::MessageResponse
 */
export interface MessageResponse {
  id: string;
  role: string;
  content: string;
  sources?: DocumentSource[];
  created_at: string;
}

/**
 * Frontend message type (camelCase, with extra UI state)
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  error?: string;
  sources?: DocumentSource[]; // Keep backend format for now
  metadata?: {
    charts?: ChartData[];
    tables?: TableData[];
  };
}

/**
 * Convert backend MessageResponse to frontend Message
 */
export function toMessage(response: MessageResponse): Message {
  return {
    id: response.id,
    role: response.role as MessageRole,
    content: response.content,
    timestamp: new Date(response.created_at),
    status: 'sent',
    sources: response.sources,
  };
}

/**
 * Convert backend ChatResponse to frontend Message
 */
export function chatResponseToMessage(response: ChatResponse): Message {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    content: response.answer,
    timestamp: new Date(response.created_at),
    status: 'sent',
    sources: response.sources,
  };
}

/**
 * Legacy DocumentReference (kept for backward compatibility)
 * Will be replaced by DocumentSource
 */
export interface DocumentReference {
  id: string;
  type: 'contract' | 'invoice' | 'purchase_order' | 'other';
  title: string;
  excerpt?: string;
  page?: number;
  url?: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any; // Tipo específico según librería de gráficas
}

export interface TableData {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category?: 'expenses' | 'sales' | 'providers' | 'documents' | 'general';
  icon?: string;
}

export interface ChatInputState {
  value: string;
  isComposing: boolean;
  rows: number;
}

export interface ChatState {
  currentConversation: Conversation | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}
