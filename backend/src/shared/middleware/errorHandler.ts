import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors';
import { errorResponse } from '../utils';
import { config } from '../../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error('Prisma error:', err);
    return res.status(400).json(
      errorResponse('DATABASE_ERROR', 'Database operation failed. Please try again.')
    );
  }

  // Handle Prisma connection errors
  if (err.message && err.message.includes('Cannot fetch data from service')) {
    console.error('Prisma connection error:', err);
    return res.status(500).json(
      errorResponse('DATABASE_CONNECTION_ERROR', 'Database connection failed. Please try again later.')
    );
  }

  // Handle validation errors (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', err)
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('INVALID_TOKEN', 'Invalid or expired token')
    );
  }

  // Handle email authentication errors
  if (err.message && err.message.includes('Username and Password not accepted')) {
    console.error('Email authentication error:', err);
    return res.status(500).json(
      errorResponse('EMAIL_CONFIG_ERROR', 'Email service configuration error. Please try again or contact support.')
    );
  }

  // Default error response
  const statusCode = 500;
  const message = config.nodeEnv === 'production'
    ? 'Internal server error'
    : err.message;

  return res.status(statusCode).json(
    errorResponse('INTERNAL_SERVER_ERROR', message)
  );
};

