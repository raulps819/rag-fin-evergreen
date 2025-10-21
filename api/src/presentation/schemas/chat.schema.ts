import { z } from 'zod';

const DocumentTypeEnum = z.enum(['CONTRACT', 'PURCHASE_ORDER', 'INVOICE', 'SALES_RECORD', 'OTHER']);

export const chatQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000, 'Query is too long'),
  documentTypes: z.array(DocumentTypeEnum).optional(),
  topK: z.number().int().positive().max(20).optional().default(5),
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }).optional(),
});

export type ChatQueryInput = z.infer<typeof chatQuerySchema>;