'use client';

import { useState, useEffect } from 'react';
import { Message as MessageType, SuggestedQuestion } from '@/types';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { SuggestedQuestions, defaultSuggestedQuestions } from './suggested-questions';
import { toast } from 'sonner';
import { sendMessage } from '@/services/chat';
import { getConversation } from '@/services/conversations';
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
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );

  // Load conversation when conversationId changes
  useEffect(() => {
    const loadConversation = async () => {
      // If conversationId changed to a new value, load it
      if (initialConversationId && initialConversationId !== conversationId) {
        console.log('[ChatContainer] Loading conversation:', initialConversationId);
        setIsLoadingConversation(true);
        setConversationId(initialConversationId);

        try {
          const conversation = await getConversation(initialConversationId);

          // Messages are already transformed by toConversationDetail
          setMessages(conversation.messages);

          console.log('[ChatContainer] Loaded', conversation.messages.length, 'messages');
        } catch (error) {
          console.error('Error loading conversation:', error);

          // If conversation doesn't exist or has no messages (new conversation), just reset
          if (error instanceof Error && error.message.includes('not found')) {
            console.log('[ChatContainer] New conversation, starting fresh');
            setMessages([]);
          } else {
            toast.error('Error al cargar la conversación: ' + getErrorMessage(error));
            setMessages([]);
          }
        } finally {
          setIsLoadingConversation(false);
        }
      } else if (!initialConversationId && conversationId) {
        // If conversationId was cleared (new chat), reset
        console.log('[ChatContainer] Starting new conversation');
        setConversationId(undefined);
        setMessages([]);
      } else if (initialConversationId === conversationId && initialConversationId) {
        // Same conversation, but might be newly created (empty)
        // Don't load if we already have messages or if it's brand new
        console.log('[ChatContainer] Conversation already loaded or is new');
      }
    };

    loadConversation();
  }, [initialConversationId]); // Only depend on initialConversationId

  const handleSendMessage = async (content: string) => {
    console.log('[ChatContainer] Sending message:', {
      content: content.substring(0, 50) + '...',
      conversationId,
    });

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
      console.log('[ChatContainer] Received response:', {
        conversationId: result.conversationId,
        messageLength: result.message.content.length,
      });

      // Always update conversation ID (backend creates it on first message)
      if (result.conversationId) {
        // Only trigger callback if it's a new conversation
        if (!conversationId) {
          onConversationChange?.(result.conversationId);
        }

        // Always update state and localStorage
        setConversationId(result.conversationId);
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
      <MessageList messages={messages} isLoading={isLoading || isLoadingConversation} />

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