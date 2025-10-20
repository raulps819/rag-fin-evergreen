import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from '@config/env.config.js';

export const registerSwagger = async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'RAG Agro API',
        description: 'API para análisis de documentos financieros agropecuarios mediante RAG',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Chat', description: 'Chat and RAG endpoints' },
        { name: 'Documents', description: 'Document management endpoints' },
        { name: 'Conversations', description: 'Conversation management endpoints' },
        { name: 'Analytics', description: 'Analytics and reports endpoints' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
};