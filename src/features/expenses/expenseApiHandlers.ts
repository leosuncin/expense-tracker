import { StatusCodes } from 'http-status-codes';

import type { UserJson as User } from '@app/features/auth/User';
import Expense, {
  ExpenseDocument,
  ExpenseJson,
} from '@app/features/expenses/Expense';
import type {
  CreateExpense,
  UpdateExpense,
} from '@app/features/expenses/expenseSchemas';
import type { ApiHandler } from '@app/utils/middleware';

export const createExpenseHandler: ApiHandler<CreateExpense, ExpenseJson> =
  async (request, response) => {
    // @ts-expect-error Is already verified by a middleware
    const author: User = request.session.get<User>('user');
    const expense = new Expense({ ...request.body, author: author.id });

    await expense.save();

    response.status(StatusCodes.CREATED).json(expense.toJSON<ExpenseJson>());
  };

export const findExpensesHandler: ApiHandler<never, ExpenseJson[]> = async (
  request,
  response,
) => {
  // @ts-expect-error Is already verified by a middleware
  const author: User = request.session.get<User>('user');
  const expenses = await Expense.find({ author: author.id }).sort({
    createdAt: 'desc',
  });

  response.json(expenses.map((expense) => expense.toJSON<ExpenseJson>()));
};

export const getExpenseHandler: ApiHandler<never, ExpenseJson> = async (
  request,
  response,
) => {
  const expenseId = request.params.id;
  // @ts-expect-error it exists, is checked in the middleware
  const expense: ExpenseDocument = await Expense.findById(expenseId);

  response.json(expense.toJSON<ExpenseJson>());
};

export const updateExpenseHandler: ApiHandler<UpdateExpense, ExpenseJson> =
  async (request, response) => {
    const expenseId = request.params.id;
    // @ts-expect-error it exists, is checked in the middleware
    const expense: ExpenseDocument = await Expense.findById(expenseId);

    expense.name = request.body.name ?? expense.name;
    expense.amount = request.body.amount ?? expense.amount;
    expense.description = request.body.description ?? expense.description;
    await expense.save();

    response.json(expense.toJSON<ExpenseJson>());
  };

export const removeExpenseHandler: ApiHandler = async (request, response) => {
  const expenseId = request.params.id;
  const expense = await Expense.findById(expenseId);

  await expense!.remove();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};
