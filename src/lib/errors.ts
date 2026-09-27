import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    void reply.status(400).send({
      error: 'ValidationError',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof AppError) {
    void reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    });
    return;
  }

  if (error.validation) {
    void reply.status(400).send({
      error: 'ValidationError',
      message: error.message,
      details: error.validation,
    });
    return;
  }

  const status = error.statusCode ?? 500;
  void reply.status(status).send({
    error: status === 500 ? 'InternalServerError' : error.name,
    message: status === 500 ? 'Internal server error' : error.message,
  });
}
