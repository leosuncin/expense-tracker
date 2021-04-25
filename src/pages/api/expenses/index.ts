import { StatusCodes } from 'http-status-codes';
import connect, { NextHandler } from 'next-connect';

import type { User } from '@app/features/auth/User';
import { Expense } from '@app/features/expenses/Expense';
import {
  CreateExpense,
  createExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import {
  ApiHandler,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

const createExpenseHandler: ApiHandler<CreateExpense> = async (
  request,
  response,
) => {
  // @ts-expect-error Is already verified by a middleware
  const author: User = request.session.get<User>('user');
  const expense = new Expense({ ...request.body, author: author._id });

  await expense.save();

  response.status(StatusCodes.CREATED).json(expense.toJSON());
};

const findExpensesHandler: ApiHandler = async (request, response) => {
  // @ts-expect-error Is already verified by a middleware
  const author: User = request.session.get<User>('user');
  const expenses = await Expense.find({ author: author._id }).sort({
    createdAt: 'desc',
  });

  response.json(expenses.map((expense) => expense.toJSON()));
};

async function verifyConditionsMiddleware(
  request: Parameters<ApiHandler>[0],
  response: Parameters<ApiHandler>[1],
  next: NextHandler,
) {
  if (request.session.get<User>('user')) {
    next();
  } else {
    response.status(StatusCodes.FORBIDDEN).json({
      message: 'You must be logged in order to access',
      statusCode: StatusCodes.FORBIDDEN,
    });
  }
}

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use(validationMiddleware(createExpenseSchema))
  .use(verifyConditionsMiddleware)
  .post(createExpenseHandler)
  .get(findExpensesHandler);
