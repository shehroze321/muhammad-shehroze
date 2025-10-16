// Base API Error
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Authentication Errors
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

// Quota Errors
export class QuotaExceededError extends ApiError {
  constructor(message = 'Quota exceeded', details?: any) {
    super(429, 'QUOTA_EXCEEDED', message, details);
    this.name = 'QuotaExceededError';
  }
}

// Subscription Errors
export class SubscriptionInactiveError extends ApiError {
  constructor(message = 'Subscription is not active') {
    super(402, 'SUBSCRIPTION_INACTIVE', message);
    this.name = 'SubscriptionInactiveError';
  }
}

// Payment Errors
export class PaymentFailedError extends ApiError {
  constructor(message = 'Payment processing failed', details?: any) {
    super(402, 'PAYMENT_FAILED', message, details);
    this.name = 'PaymentFailedError';
  }
}

// Validation Errors
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

// Not Found Errors
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Conflict Error
export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

// Bad Request Error
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details?: any) {
    super(400, 'BAD_REQUEST', message, details);
    this.name = 'BadRequestError';
  }
}

// Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
    this.name = 'InternalServerError';
  }
}

