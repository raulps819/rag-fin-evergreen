import { z } from 'zod';

// Enum values for validation
const DocumentTypeEnum = z.enum(['CONTRACT', 'PURCHASE_ORDER', 'INVOICE', 'SALES_RECORD', 'OTHER']);
const DocumentStatusEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);

export const uploadDocumentSchema = z.object({
  documentType: DocumentTypeEnum,
  isTemporary: z.boolean().optional().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const listDocumentsQuerySchema = z.object({
  type: DocumentTypeEnum.optional(),
  status: DocumentStatusEnum.optional(),
  isTemporary: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export const documentIdParamSchema = z.object({
  id: z.string().min(1),
});

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;