'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
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
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const minRows = 1;
  const maxRows = 8;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate new height
      textareaRef.current.style.height = 'auto';

      const lineHeight = 24; // Approximate line height in pixels
      const scrollHeight = textareaRef.current.scrollHeight;
      const newRows = Math.min(
        Math.max(Math.floor(scrollHeight / lineHeight), minRows),
        maxRows
      );

      setRows(newRows);
    }
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
      setRows(minRows);
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
    <div className={cn('border-t bg-background p-4', className)}>
      <div className="max-w-4xl mx-auto">
        <InputGroup>
          {/* Textarea */}
          <div className="flex-1 relative">
            <InputGroupTextarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              className={cn(
                'min-h-[44px] max-h-[200px] resize-none pr-12',
                isOverLimit && 'border-yellow-500 focus-visible:ring-yellow-500'
              )}
            />

            {/* Character counter */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
              <span className={cn(isOverLimit && 'text-yellow-600 font-medium')}>
                {value.length}
              </span>
              <span className="text-muted-foreground/50">/{maxLength}</span>
            </div>
          </div>

          {/* Send button */}
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={handleSubmit}
              disabled={!canSend}
              size="icon-sm"
              className="h-[44px] w-[44px] shrink-0"
            >
              {disabled ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Enviar mensaje</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Presiona <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Enter</kbd> para enviar,{' '}
          <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Shift</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Enter</kbd> para nueva línea
        </p>
      </div>
    </div>
  );
}