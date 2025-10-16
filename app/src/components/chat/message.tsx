'use client';

import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

export function Message({ message, isLast }: MessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const hasError = message.status === 'error';

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="" alt="Usuario" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" alt="Asistente" />
            <AvatarFallback className="bg-muted">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 sm:gap-2 max-w-[85%] sm:max-w-[80%] min-w-0', isUser && 'items-end')}>
        {/* Message bubble */}
        <div
          className={cn(
            'rounded-lg px-3 py-2 sm:px-4 sm:py-2 break-words text-sm sm:text-base',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            hasError && 'border border-destructive'
          )}
        >
          {/* Content */}
          {isStreaming ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            </div>
          )}

          {/* Typing indicator */}
          {isStreaming && isLast && (
            <div className="flex gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && message.error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.error}</AlertDescription>
          </Alert>
        )}
        

        {/* Document references */}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.metadata.sources.map((source) => (
              <button
                key={source.id}
                className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
              >
                {source.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}