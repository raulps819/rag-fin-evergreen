'use client';

import { useState, useEffect } from 'react';
import { Message as MessageType, SuggestedQuestion } from '@/types';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { SuggestedQuestions, defaultSuggestedQuestions } from './suggested-questions';
import { toast } from 'sonner';
import { sendMessage } from '@/services/chat';
import { getErrorMessage } from '@/lib/api-client';

interface ChatContainerProps {
  initialMessages?: MessageType[];
  suggestedQuestions?: SuggestedQuestion[];
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
}

export function ChatContainer({
  initialMessages = [],
  suggestedQuestions = defaultSuggestedQuestions,
  conversationId: initialConversationId,
  onConversationChange,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );

  // Update messages when initialMessages change (e.g., when loading a conversation)
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Update conversationId when prop changes
  useEffect(() => {
    setConversationId(initialConversationId);
  }, [initialConversationId]);

  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call backend API
      const result = await sendMessage(content, conversationId);

      // Update conversation ID if this is a new conversation
      if (!conversationId && result.conversationId) {
        setConversationId(result.conversationId);
        onConversationChange?.(result.conversationId);

        // Save to localStorage for persistence
        localStorage.setItem('currentConversationId', result.conversationId);
      }

      // Add assistant message with sources
      setMessages((prev) => [...prev, result.message]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: MessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        timestamp: new Date(),
        status: 'error',
        error: getErrorMessage(error),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const showSuggestedQuestions = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Suggested questions (only shown when no messages) */}
      {showSuggestedQuestions && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={handleSelectQuestion}
        />
      )}

      {/* Input area */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}