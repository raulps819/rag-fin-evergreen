import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '@config/env.config.js';

export const registerCors = async (app: FastifyInstance) => {
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
};