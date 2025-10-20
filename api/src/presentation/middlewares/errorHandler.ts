import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@shared/errors/AppError.js';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    });
  }

  // Errores de validación de Zod
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.validation,
    });
  }

  // Log del error para debugging
  request.log.error(error);

  // Error genérico
  return reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};