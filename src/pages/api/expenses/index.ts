import { StatusCodes } from 'http-status-codes';
import connect from 'next-connect';

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
  const author = request.session.get<User>('user');

  if (!author) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: 'You must be logged in order to access',
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  const expense = new Expense({ ...request.body, author: author._id });
  await expense.save();

  response.status(StatusCodes.CREATED).json(expense.toJSON());
};

const findExpensesHandler: ApiHandler = async (request, response) => {
  const author = request.session.get<User>('user');

  if (!author) {
    response.status(StatusCodes.FORBIDDEN).json({
      message: 'You must be logged in order to access',
      statusCode: StatusCodes.FORBIDDEN,
    });
    return;
  }

  const expenses = await Expense.find({ author: author._id });

  response.json(expenses.map((expense) => expense.toJSON()));
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use(validationMiddleware(createExpenseSchema))
  .post(createExpenseHandler)
  .get(findExpensesHandler);
