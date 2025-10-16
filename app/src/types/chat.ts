export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error' | 'streaming';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  error?: string;
  metadata?: {
    sources?: DocumentReference[];
    charts?: ChartData[];
    tables?: TableData[];
  };
}

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
