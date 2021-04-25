import { StatusCodes } from 'http-status-codes';
import { Error as MongooseError, isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';
import { Session, ironSession } from 'next-iron-session';
import { ZodError, ZodType } from 'zod';

import { connectDB } from '@app/app/db';

interface ApiRequest<Schema = Record<string, unknown>> extends NextApiRequest {
  session: Session;
  body: Schema;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'DELETE' | 'HEAD';
}

export type ApiHandler<Schema = any, Result = any> = (
  request: ApiRequest<Schema>,
  response: NextApiResponse<Result>,
) => void | Promise<void>;

export interface ErrorResponse {
  message: string;
  statusCode: number;
  errors?: string[];
}

export async function databaseMiddleware(
  _: NextApiRequest,
  __: NextApiResponse,
  next: NextHandler,
) {
  try {
    await connectDB();
    next();
  } catch (error: unknown) {
    next(error);
  }
}

export function errorMiddleware(
  error: unknown,
  _: NextApiRequest,
  response: NextApiResponse<ErrorResponse>,
) {
  let status = 501;
  let errorResponse: ErrorResponse = {
    message: 'Error',
    statusCode: status,
  };

  if (error instanceof Error) {
    status = 500;
    errorResponse = {
      message: error.message,
      statusCode: status,
    };
  }

  if (error instanceof ZodError) {
    status = 422;
    errorResponse = {
      message: 'Validation error',
      statusCode: status,
      errors: error.errors.map((error) => error.message),
    };
  }

  if (error instanceof MongooseError.ValidationError) {
    status = 409;
    errorResponse = {
      message: 'Duplicate data: is already register',
      statusCode: status,
      errors: Object.entries<Error>(error.errors).map(
        ([path, error]) => path + ' ' + error.message,
      ),
    };
  }

  if (status >= 500) console.error(errorResponse);

  response.status(status).json(errorResponse);
}

export const sessionMiddleware: (
  request: ApiRequest,
  response: NextApiResponse,
  next: NextHandler,
) => void | Promise<void> = ironSession({
  cookieName: 'app-session',
  password: process.env.SECRET_COOKIE_PASSWORD,
  // If your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

export function validationMiddleware<Schema extends Record<string, unknown>>(
  schema: ZodType<Schema>,
) {
  return (
    request: ApiRequest<Schema>,
    _: NextApiResponse,
    next: NextHandler,
  ) => {
    try {
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        request.body = schema.parse(request.body);
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}

export function castObjectIdMiddleware(
  request: ApiRequest,
  response: NextApiResponse<ErrorResponse>,
  next: NextHandler,
) {
  if (isValidObjectId(request.query.id)) {
    next();
  } else {
    response.status(StatusCodes.BAD_REQUEST).json({
      message: `${request.query.id as string} is not a valid ID`,
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }
}
