import { StatusCodes } from 'http-status-codes';
import { Error as MongooseError, isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';
import { Session, SessionOptions, ironSession } from 'next-iron-session';
import { ZodError, ZodType } from 'zod';

import { connectDB } from '@app/app/db';

export interface ApiRequest<Schema = Record<string, unknown>>
  extends NextApiRequest {
  session: Session;
  body: Schema;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'DELETE' | 'HEAD';
  params: Record<string, string>;
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
  let statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  let message = 'Error';
  let errors;

  if (error instanceof Error) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = error.message;
  }

  if (error instanceof ZodError) {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    message = 'Validation error';
    errors = error.errors.map((error) => error.message);
  }

  if (error instanceof MongooseError.ValidationError) {
    statusCode = StatusCodes.CONFLICT;
    message = 'Duplicate data: is already register';
    errors = Object.entries<Error>(error.errors).map(
      ([path, error]) => path + ' ' + error.message,
    );
  }

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) console.error(message);

  response.status(statusCode).json({ message, statusCode, errors });
}

export const sessionOptions: SessionOptions = {
  cookieName: 'app-session',
  password: process.env.SECRET_COOKIE_PASSWORD,
  // If your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
};

export const sessionMiddleware: (
  request: ApiRequest,
  response: NextApiResponse,
  next: NextHandler,
) => void | Promise<void> = ironSession(sessionOptions);

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
  request: ApiRequest & { query: { id: string[] } },
  response: NextApiResponse<ErrorResponse>,
  next: NextHandler,
) {
  if (isValidObjectId(request.params.id)) {
    next();
  } else {
    response.status(StatusCodes.BAD_REQUEST).json({
      message: `${request.params.id} is not a valid ID`,
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }
}
