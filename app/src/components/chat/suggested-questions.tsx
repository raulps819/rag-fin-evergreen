'use client';

import { SuggestedQuestion } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (question: string) => void;
  className?: string;
}

const categoryIcons = {
  expenses: DollarSign,
  sales: TrendingUp,
  providers: Users,
  documents: FileText,
  general: HelpCircle,
};

export function SuggestedQuestions({
  questions,
  onSelect,
  className,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className={cn('p-3 sm:p-4 border-t bg-muted/30', className)}>
      <div className="max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 font-medium">
          Preguntas sugeridas:
        </p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {questions.map((question) => {
            const Icon = question.category
              ? categoryIcons[question.category]
              : ChevronRight;

            return (
              <button
                key={question.id}
                onClick={() => onSelect(question.text)}
                className={cn(
                  'inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full',
                  'text-xs sm:text-sm font-medium transition-all',
                  'bg-background hover:bg-accent hover:text-accent-foreground',
                  'border border-border hover:border-primary/50',
                  'shadow-sm hover:shadow-md',
                  'group'
                )}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="max-w-[200px] sm:max-w-[300px] truncate">{question.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Default questions for initial state
export const defaultSuggestedQuestions: SuggestedQuestion[] = [
  {
    id: '1',
    text: '¿Cuánto gasté en fertilizantes este mes?',
    category: 'expenses',
  },
  {
    id: '2',
    text: '¿Cuáles son mis mejores proveedores?',
    category: 'providers',
  },
  {
    id: '3',
    text: 'Muestra el resumen de ventas del trimestre',
    category: 'sales',
  },
  {
    id: '4',
    text: '¿Qué contratos vencen próximamente?',
    category: 'documents',
  },
  {
    id: '5',
    text: 'Compara los precios de semillas de maíz',
    category: 'providers',
  },
  {
    id: '6',
    text: '¿Cuál fue mi producto más vendido?',
    category: 'sales',
  },
];