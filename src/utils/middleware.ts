import { Error } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';
import { Session, ironSession } from 'next-iron-session';

import { connectDB } from '@app/app/db';

interface ApiRequest extends NextApiRequest {
  session: Session;
}

export type ApiHandler<Result = any> = (
  request: ApiRequest,
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
  next?: NextHandler,
) {
  if (error instanceof Error.ValidationError) {
    response.status(422).json({
      message: 'Validation error',
      statusCode: 422,
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

  if (next) next();
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
