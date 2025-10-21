import { FastifyInstance } from 'fastify';
import { container } from '@di/container.js';
import { ChatController } from '@presentation/controllers/ChatController.js';

export async function chatRoutes(fastify: FastifyInstance) {
  const chatController = container.resolve(ChatController);

  // POST /api/chat - Query with complete response
  fastify.post('/chat', {
    schema: {
      description: 'Send a chat query and get a RAG response with sources',
      tags: ['chat'],
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 1000 },
          documentTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['CONTRACT', 'PURCHASE_ORDER', 'INVOICE', 'SALES_RECORD', 'OTHER'],
            },
          },
          topK: { type: 'number', minimum: 1, maximum: 20, default: 5 },
          dateRange: {
            type: 'object',
            properties: {
              from: { type: 'string', format: 'date-time' },
              to: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  documentId: { type: 'string' },
                  content: { type: 'string' },
                  score: { type: 'number' },
                  metadata: {
                    type: 'object',
                    properties: {
                      documentType: { type: 'string' },
                      originalName: { type: 'string' },
                      pageNumber: { type: 'number' },
                      chunkIndex: { type: 'number' },
                    },
                  },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                modelUsed: { type: 'string' },
                retrievalTime: { type: 'number' },
                generationTime: { type: 'number' },
                totalTokens: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: chatController.query.bind(chatController),
  });

  // POST /api/chat/stream - Query with streaming response
  fastify.post('/chat/stream', {
    schema: {
      description: 'Send a chat query and get a streaming RAG response',
      tags: ['chat'],
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 1000 },
          documentTypes: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['CONTRACT', 'PURCHASE_ORDER', 'INVOICE', 'SALES_RECORD', 'OTHER'],
            },
          },
          topK: { type: 'number', minimum: 1, maximum: 20, default: 5 },
          dateRange: {
            type: 'object',
            properties: {
              from: { type: 'string', format: 'date-time' },
              to: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    handler: chatController.queryStream.bind(chatController),
  });
}