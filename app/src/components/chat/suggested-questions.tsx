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
    id: 'sales-seasonality',
    text: '¿Cómo se distribuyeron las ventas de cereales por temporada en 2024?',
    category: 'sales',
  },
  {
    id: 'general-quarterly-payments',
    text: 'Dame un resumen trimestral de las ventas y del uso de métodos de pago (cheque, transferencia, etc.).',
    category: 'general',
  },
  {
    id: 'expenses-seed-supplier',
    text: 'Calcula cuánto gastamos en semillas con Semillería Argentina durante 2024.',
    category: 'expenses',
  },
  {
    id: 'providers-top-confirmed',
    text: '¿Qué proveedores tienen más órdenes de compra confirmadas y cuánto representan en total?',
    category: 'providers',
  },
  {
    id: 'documents-due-invoices',
    text: 'Lista las facturas pendientes y vencidas con sus importes y fechas de emisión.',
    category: 'documents',
  },
  {
    id: 'documents-lease-renewals',
    text: '¿Qué contratos de arrendamiento están vigentes y cuáles vencen en los próximos 12 meses?',
    category: 'documents',
  },
];