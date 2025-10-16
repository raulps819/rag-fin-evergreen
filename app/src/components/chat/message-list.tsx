'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { Message } from './message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  className?: string;
}

export function MessageList({ messages, isLoading, className }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Bienvenido al Asistente Agropecuario
          </h3>
          <p className="text-sm text-muted-foreground">
            Pregunta sobre tus gastos, ventas, contratos o cualquier información de tu operación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div ref={scrollRef} className="flex flex-col">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 px-4 py-6">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-2 max-w-[80%]">
              <div className="rounded-lg px-4 py-3 bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}