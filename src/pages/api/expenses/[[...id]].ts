import { StatusCodes } from 'http-status-codes';
import type { LeanDocument } from 'mongoose';
import connect, { NextHandler } from 'next-connect';

import type { User } from '@app/features/auth/User';
import { Expense } from '@app/features/expenses/Expense';
import {
  CreateExpense,
  UpdateExpense,
  createExpenseSchema,
  updateExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import {
  ApiHandler,
  ErrorResponse,
  castObjectIdMiddleware,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

export interface ExpenseResponse extends Omit<LeanDocument<Expense>, 'author'> {
  _id: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const createExpenseHandler: ApiHandler<CreateExpense, ExpenseResponse> = async (
  request,
  response,
) => {
  // @ts-expect-error Is already verified by a middleware
  const author: User = request.session.get<User>('user');
  const expense = new Expense({ ...request.body, author: author._id });

  await expense.save();

  response
    .status(StatusCodes.CREATED)
    .json((expense.toJSON() as unknown) as ExpenseResponse);
};

const findExpensesHandler: ApiHandler<never, ExpenseResponse[]> = async (
  request,
  response,
) => {
  // @ts-expect-error Is already verified by a middleware
  const author: User = request.session.get<User>('user');
  const expenses = await Expense.find({ author: author._id }).sort({
    createdAt: 'desc',
  });

  response.json(
    (expenses.map((expense) =>
      expense.toJSON(),
    ) as unknown) as ExpenseResponse[],
  );
};

async function verifyReadConditionsMiddleware(
  request: Parameters<ApiHandler>[0],
  response: Parameters<ApiHandler<ErrorResponse>>[1],
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

const getExpenseHandler: ApiHandler<never, ExpenseResponse> = async (
  request,
  response,
) => {
  const expenseId = request.params.id;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  response.json((expense.toJSON() as unknown) as ExpenseResponse);
};

const updateExpenseHandler: ApiHandler<UpdateExpense, ExpenseResponse> = async (
  request,
  response,
) => {
  const expenseId = request.params.id;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  expense.name = request.body.name ?? expense.name;
  expense.amount = request.body.amount ?? expense.amount;
  expense.description = request.body.description ?? expense.description;
  await expense.save();

  response.json((expense.toJSON() as unknown) as ExpenseResponse);
};

const removeExpenseHandler: ApiHandler = async (request, response) => {
  const expenseId = request.params.id;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: Expense = await Expense.findById(expenseId);

  await expense.remove();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};

async function verifyWriteConditionsMiddleware(
  request: Parameters<ApiHandler>[0],
  response: Parameters<ApiHandler<unknown, ErrorResponse>>[1],
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
  if (expense.author.toHexString() !== author._id && !author.isAdmin) {
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

export default connect({ onError: errorMiddleware, attachParams: true })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use('/api/expenses', verifyReadConditionsMiddleware)
  .use('/api/expenses', validationMiddleware(createExpenseSchema))
  .post('/api/expenses', createExpenseHandler)
  .get('/api/expenses', findExpensesHandler)
  .use('/api/expenses/:id', castObjectIdMiddleware)
  .use('/api/expenses/:id', verifyWriteConditionsMiddleware)
  .use('/api/expenses/:id', validationMiddleware(updateExpenseSchema))
  .get('/api/expenses/:id', getExpenseHandler)
  .put('/api/expenses/:id', updateExpenseHandler)
  .delete('/api/expenses/:id', removeExpenseHandler);
