'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector, AIModel } from './model-selector';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Escribe tu pregunta...',
  maxLength = 2000,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-oss-120b');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const minRows = 1;
  const maxRows = 8;

  // Auto-resize textarea
  const updateTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const newHeight = Math.min(
        Math.max(scrollHeight, lineHeight * minRows),
        lineHeight * maxRows
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    updateTextareaHeight();
  }, [value]);

  // Keep focus on input after response is received
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  };

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled) {
      onSend(trimmedValue);
      setValue('');
      // Reset textarea height after submit
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isOverLimit = value.length > maxLength * 0.9; // Warning at 90%
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={cn('bg-transparent p-2 sm:p-2', className)}>
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Main input card */}
        <Card className="shadow-lg border-muted-foreground/10 transition-shadow hover:shadow-xl p-2">
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="shrink-0">
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                disabled={disabled}
              />
            </div>

            {/* Textarea container */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className={cn(
                  'resize-none bg-transparent',
                  'border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                  'text-sm sm:text-base',
                  'placeholder:text-muted-foreground/60',
                  'min-h-[24px] max-h-[192px]',
                  'py-2 px-0',
                  'overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20'
                )}
                style={{ lineHeight: '24px' }}
              />

              {/* Character counter */}
              <div
                className={cn(
                  'absolute bottom-1 right-1 text-xs pointer-events-none',
                  'px-1.5 py-0.5 rounded-md backdrop-blur-sm',
                  'bg-background/80 border border-muted-foreground/10',
                  'transition-colors duration-200',
                  isOverLimit ? 'text-yellow-600 border-yellow-500/30' : 'text-muted-foreground'
                )}
              >
                <span className={cn('font-medium', isOverLimit && 'text-yellow-600')}>
                  {value.length}
                </span>
                <span className="text-muted-foreground/60">/{maxLength}</span>
              </div>
            </div>

            {/* Send button */}
            <div className="shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={!canSend}
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-xl transition-all duration-200',
                  canSend
                    ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-105'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {disabled ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Helper text */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground px-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-xs font-mono border rounded-md bg-muted/50 shadow-sm">
              Enter
            </kbd>
            <span>para enviar</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <kbd className="px-2 py-1 text-xs font-mono border rounded-md bg-muted/50 shadow-sm">
                Shift
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 text-xs font-mono border rounded-md bg-muted/50 shadow-sm">
                Enter
              </kbd>
            </div>
            <span>para nueva línea</span>
          </div>
        </div>
      </div>
    </div>
  );
}