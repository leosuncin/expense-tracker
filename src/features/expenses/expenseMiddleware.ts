import { StatusCodes } from 'http-status-codes';
import type { NextApiResponse } from 'next';
import type { NextHandler } from 'next-connect';

import type { UserJson as User } from '@app/features/auth/User';
import Expense from '@app/features/expenses/Expense';
import { ApiRequest, ErrorResponse } from '@app/utils/middleware';

export async function verifyReadConditionsMiddleware(
  request: ApiRequest,
  response: NextApiResponse<ErrorResponse>,
  next: NextHandler,
) {
  if (request.session.get<User>('user')) {
    next();
  } else {
    response.status(StatusCodes.UNAUTHORIZED).json({
      message: 'You must be logged in order to access',
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  }
}

export async function verifyWriteConditionsMiddleware(
  request: ApiRequest<unknown>,
  response: NextApiResponse<ErrorResponse>,
  next: NextHandler,
) {
  const expenseId = request.params.id;
  const author = request.session.get<User>('user');
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    response.status(StatusCodes.NOT_FOUND).json({
      message: `There is not any expense with id: ${expenseId}`,
      statusCode: StatusCodes.NOT_FOUND,
    });
    return;
  }

  // @ts-expect-error `author` is not populated
  if (expense.author.toHexString() !== author.id && !author.isAdmin) {
    const action =
      request.method === 'DELETE'
        ? 'remove'
        : request.method === 'PUT'
        ? 'modify'
        : 'access';
    response.status(StatusCodes.FORBIDDEN).json({
      message: `You need to be the author of the expense in order to ${action} it`,
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  next();
}
