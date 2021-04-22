import { Error as MongooseError } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';
import { Session, ironSession } from 'next-iron-session';
import { ZodError, ZodType } from 'zod';

import { connectDB } from '@app/app/db';

interface ApiRequest<Schema = Record<string, unknown>> extends NextApiRequest {
  session: Session;
  body: Schema;
}

export type ApiHandler<Schema = any, Result = any> = (
  request: ApiRequest<Schema>,
  response: NextApiResponse<Result>,
) => void | Promise<void>;

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

export async function errorMiddleware(
  error: unknown,
  _: NextApiRequest,
  response: NextApiResponse,
) {
  if (error instanceof ZodError) {
    response.status(422).json({
      message: 'Validation error',
      statusCode: 422,
      errors: error.errors.map((error) => error.message),
    });
  } else if (error instanceof MongooseError.ValidationError) {
    response.status(409).json({
      message: 'Duplicate data: is already register',
      statusCode: 409,
      errors: Object.entries<Error>(error.errors).map(
        ([path, error]) => path + ' ' + error.message,
      ),
    });
  } else if (error instanceof Error) {
    response.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
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
      request.body = schema.parse(request.body);
      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}
