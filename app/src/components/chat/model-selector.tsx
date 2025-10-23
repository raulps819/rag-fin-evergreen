'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Sparkles, Zap, Brain, Cpu, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIModel = 'gpt-oss-120b' | 'gpt-oss-20b' | 'gpt-5-nano' | 'gpt-5';

interface ModelOption {
  value: AIModel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const modelOptions: ModelOption[] = [
  {
    value: 'gpt-oss-120b',
    label: 'GPT OSS 120B',
    description: 'Modelo más potente y completo',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-purple-500',
  },
  {
    value: 'gpt-oss-20b',
    label: 'GPT OSS 20B',
    description: 'Balance entre velocidad y capacidad',
    icon: <Brain className="h-4 w-4" />,
    color: 'text-blue-500',
  },
  {
    value: 'gpt-5-nano',
    label: 'GPT-5 Nano',
    description: 'Rápido y eficiente',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-green-500',
  },
  {
    value: 'gpt-5',
    label: 'GPT-5',
    description: 'Última generación',
    icon: <Cpu className="h-4 w-4" />,
    color: 'text-orange-500',
  },
];

interface ModelSelectorProps {
  value?: AIModel;
  onChange?: (model: AIModel) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({
  value: controlledValue,
  onChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  // Internal state for aesthetic-only mode
  const [internalValue, setInternalValue] = useState<AIModel>('gpt-oss-120b');

  const value = controlledValue ?? internalValue;
  const selectedModel = modelOptions.find((opt) => opt.value === value) ?? modelOptions[0];

  const handleSelect = (model: AIModel) => {
    if (onChange) {
      onChange(model);
    } else {
      setInternalValue(model);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            'h-9 w-9 rounded-lg transition-all',
            'hover:bg-accent hover:text-accent-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <Bot className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Seleccionar modelo de IA</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Seleccionar modelo
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {modelOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'flex items-start gap-3 cursor-pointer py-2.5',
              value === option.value && 'bg-accent'
            )}
          >
            <span className={cn('mt-0.5', option.color)}>{option.icon}</span>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{option.label}</span>
                {value === option.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-tight">
                {option.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
