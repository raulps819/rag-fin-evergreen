import { FastifyInstance } from 'fastify';
import { container } from '@di/container.js';
import { DocumentsController } from '@presentation/controllers/DocumentsController.js';

export async function documentsRoutes(fastify: FastifyInstance) {
  const controller = container.resolve(DocumentsController);

  // POST /documents/upload - Subir un documento
  fastify.post('/upload', {
    schema: {
      description: 'Upload a document',
      tags: ['documents'],
      consumes: ['multipart/form-data'],
      response: {
        201: {
          description: 'Document uploaded successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            documentType: { type: 'string' },
            size: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
    handler: controller.upload.bind(controller),
  });

  // GET /documents - Listar documentos
  fastify.get('/', {
    schema: {
      description: 'List documents',
      tags: ['documents'],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          status: { type: 'string' },
          isTemporary: { type: 'string' },
          search: { type: 'string' },
          limit: { type: 'string' },
          offset: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'List of documents',
          type: 'object',
          properties: {
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  filename: { type: 'string' },
                  originalName: { type: 'string' },
                  documentType: { type: 'string' },
                  status: { type: 'string' },
                  size: { type: 'number' },
                  pageCount: { type: 'number' },
                  createdAt: { type: 'string' },
                },
              },
            },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
          },
        },
      },
    },
    handler: controller.list.bind(controller),
  });

  // GET /documents/:id - Obtener un documento
  fastify.get('/:id', {
    schema: {
      description: 'Get document by ID',
      tags: ['documents'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Document details',
          type: 'object',
          properties: {
            id: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            filepath: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'number' },
            documentType: { type: 'string' },
            status: { type: 'string' },
            pageCount: { type: 'number' },
            isTemporary: { type: 'boolean' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
    handler: controller.getById.bind(controller),
  });

  // GET /documents/:id/download - Descargar un documento
  fastify.get('/:id/download', {
    schema: {
      description: 'Download document file',
      tags: ['documents'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: controller.download.bind(controller),
  });

  // DELETE /documents/:id - Eliminar un documento
  fastify.delete('/:id', {
    schema: {
      description: 'Delete document',
      tags: ['documents'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        204: {
          description: 'Document deleted successfully',
          type: 'null',
        },
      },
    },
    handler: controller.delete.bind(controller),
  });
}