import 'reflect-metadata';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { serverConfig } from '@config/server.config.js';
import { env } from '@config/env.config.js';
import { registerCors } from '@presentation/middlewares/corsMiddleware.js';
import { registerSwagger } from '@presentation/plugins/swagger.plugin.js';
import { errorHandler } from '@presentation/middlewares/errorHandler.js';
import { healthRoutes } from '@presentation/routes/health.routes.js';
import { documentsRoutes } from '@presentation/routes/documents.routes.js';

// Import DI container to initialize it
import '@di/container.js';


const buildServer = () => {
  const app = Fastify(serverConfig);

  // Register error handler
  app.setErrorHandler(errorHandler);

  return app;
};

const start = async () => {
  const app = buildServer();

  try {
    // Register plugins
    await registerCors(app);
    await app.register(multipart);
    await registerSwagger(app);

    // Register routes
    await app.register(healthRoutes, { prefix: '/api/v1' });
    await app.register(documentsRoutes, { prefix: '/api/v1/documents' });

    // Start server
    await app.listen({ port: env.PORT, host: env.HOST });

    app.log.info(`Server listening on http://${env.HOST}:${env.PORT}`);
    app.log.info(`Swagger documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
