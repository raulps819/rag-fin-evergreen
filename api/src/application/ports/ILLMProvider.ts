export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Interface for Large Language Model providers
 * Supports both OpenAI and local models (Ollama)
 */
export interface ILLMProvider {
  /**
   * Generate a chat completion
   * @param messages - Array of chat messages
   * @param options - Optional configuration for the completion
   * @returns The completion response
   */
  chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Generate a streaming chat completion
   * @param messages - Array of chat messages
   * @param options - Optional configuration for the completion
   * @returns Async generator yielding content chunks
   */
  chatCompletionStream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<StreamChunk>;

  /**
   * Check if the provider is available and configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the provider name (e.g., "openai", "ollama")
   */
  getProviderName(): string;
}