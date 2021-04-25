import { StatusCodes } from 'http-status-codes';
import connect from 'next-connect';

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

  // @ts-expect-error
  if (expense.author.toHexString() !== author._id && !author.isAdmin) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: `You need to be the author of the expense in order to access it`,
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  response.json(expense.toJSON());
};

const updateExpenseHandler: ApiHandler<UpdateExpense> = async (
  request,
  response,
) => {
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

  // @ts-expect-error
  if (expense.author.toHexString() !== author._id && !author.isAdmin) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: `You need to be the author of the expense in order to access it`,
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  expense.name = request.body.name ?? expense.name;
  expense.amount = request.body.amount ?? expense.amount;
  expense.description = request.body.description ?? expense.description;
  await expense.save();

  response.json(expense.toJSON());
};

const removeExpenseHandler: ApiHandler = async (request, response) => {
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

  // @ts-expect-error
  if (expense.author.toHexString() !== author._id && !author.isAdmin) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: `You need to be the author of the expense in order to access it`,
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  await expense.remove();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use(castObjectIdMiddleware)
  .use(validationMiddleware(updateExpenseSchema))
  .get(getExpenseHandler)
  .put(updateExpenseHandler)
  .delete(removeExpenseHandler);
