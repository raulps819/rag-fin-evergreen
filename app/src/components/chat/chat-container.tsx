'use client';

import { useState } from 'react';
import { Message as MessageType, SuggestedQuestion } from '@/types';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { SuggestedQuestions, defaultSuggestedQuestions } from './suggested-questions';
import { toast } from 'sonner';

interface ChatContainerProps {
  initialMessages?: MessageType[];
  suggestedQuestions?: SuggestedQuestion[];
}

export function ChatContainer({
  initialMessages = [],
  suggestedQuestions = defaultSuggestedQuestions,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: content, conversationId: 'current' }),
      // });
      // const data = await response.json();

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Respuesta simulada para: "${content}"\n\nEsta es una respuesta de ejemplo. Cuando conectes con el backend, aquí aparecerá la respuesta real del sistema RAG.`,
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: MessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        timestamp: new Date(),
        status: 'error',
        error: 'Error de conexión. Por favor, intenta nuevamente.',
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast.error('No se pudo enviar el mensaje. Intenta nuevamente.');
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