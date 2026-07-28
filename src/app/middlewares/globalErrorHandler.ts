import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import AppError from '../../helpers/AppError';
import StatusCode from '../utils/statusCode';

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode: number = StatusCode.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errorSources: { path: string; message: string }[] = [];

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = StatusCode.BAD_REQUEST;
    message = 'Validation Error';

    errorSources = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Handle custom application errors
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Handle generic errors
  else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources: errorSources.length ? errorSources : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

export default globalErrorHandler;
