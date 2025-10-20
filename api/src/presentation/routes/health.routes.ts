import type { FastifyInstance } from 'fastify';

export const healthRoutes = async (app: FastifyInstance) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              timestamp: { type: 'string', format: 'date-time' },
              version: { type: 'string' },
              services: {
                type: 'object',
                properties: {
                  database: { type: 'string', enum: ['up', 'down'] },
                  vectorStore: { type: 'string', enum: ['up', 'down'] },
                  llm: { type: 'string', enum: ['up', 'down'] },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar checks reales de servicios
      const health = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: 'up' as const,
          vectorStore: 'up' as const,
          llm: 'up' as const,
        },
      };

      return reply.status(200).send(health);
    }
  );

  app.get(
    '/status',
    {
      schema: {
        tags: ['Health'],
        description: 'Detailed system status',
        response: {
          200: {
            type: 'object',
            properties: {
              uptime: { type: 'number' },
              memory: {
                type: 'object',
                properties: {
                  used: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const memUsage = process.memoryUsage();
      const status = {
        uptime: process.uptime(),
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
        },
      };

      return reply.status(200).send(status);
    }
  );
};
