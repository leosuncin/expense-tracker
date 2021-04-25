import { StatusCodes } from 'http-status-codes';
import connect, { NextHandler } from 'next-connect';

import type { User } from '@app/features/auth/User';
import { Expense } from '@app/features/expenses/Expense';
import {
  UpdateExpense,
  updateExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import {
  ApiHandler,
  castObjectIdMiddleware,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

const getExpenseHandler: ApiHandler = async (request, response) => {
  const expenseId = request.query.id as string;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  response.json(expense.toJSON());
};

const updateExpenseHandler: ApiHandler<UpdateExpense> = async (
  request,
  response,
) => {
  const expenseId = request.query.id as string;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  expense.name = request.body.name ?? expense.name;
  expense.amount = request.body.amount ?? expense.amount;
  expense.description = request.body.description ?? expense.description;
  await expense.save();

  response.json(expense.toJSON());
};

const removeExpenseHandler: ApiHandler = async (request, response) => {
  const expenseId = request.query.id as string;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  await expense.remove();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};

async function verifyConditionsMiddleware(
  request: Parameters<ApiHandler>[0],
  response: Parameters<ApiHandler>[1],
  next: NextHandler,
) {
  const expenseId = request.query.id as string;
  const author = request.session.get<User>('user');

  if (!author) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: 'You must be logged in order to access',
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  const expense = await Expense.findById(expenseId);

  if (!expense) {
    response.status(StatusCodes.NOT_FOUND).json({
      message: `There is not any expense with id: ${expenseId}`,
      statusCode: StatusCodes.NOT_FOUND,
    });
    return;
  }

  // @ts-expect-error `author` is not populated
  if (expense.author.toHexString() !== author._id && !author.isAdmin) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: `You need to be the author of the expense in order to access it`,
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  next();
}

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use(castObjectIdMiddleware)
  .use(verifyConditionsMiddleware)
  .use(validationMiddleware(updateExpenseSchema))
  .get(getExpenseHandler)
  .put(updateExpenseHandler)
  .delete(removeExpenseHandler);
