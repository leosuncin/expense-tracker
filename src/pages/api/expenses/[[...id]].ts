import connect from 'next-connect';

import {
  createExpenseHandler,
  findExpensesHandler,
  getExpenseHandler,
  removeExpenseHandler,
  updateExpenseHandler,
} from '@app/features/expenses/expenseApiHandlers';
import {
  verifyReadConditionsMiddleware,
  verifyWriteConditionsMiddleware,
} from '@app/features/expenses/expenseMiddleware';
import {
  CreateExpense,
  UpdateExpense,
  createExpenseSchema,
  updateExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import {
  ApiRequest,
  castObjectIdMiddleware,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

export default connect({ onError: errorMiddleware, attachParams: true })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .use('/api/expenses', verifyReadConditionsMiddleware)
  .use((request: ApiRequest<CreateExpense | UpdateExpense>, response, next) => {
    validationMiddleware(
      request.method === 'POST' ? createExpenseSchema : updateExpenseSchema,
    )(request, response, next);
  })
  .post('/api/expenses', createExpenseHandler)
  .get('/api/expenses', findExpensesHandler)
  .use('/api/expenses/:id', castObjectIdMiddleware)
  .use('/api/expenses/:id', verifyWriteConditionsMiddleware)
  .get('/api/expenses/:id', getExpenseHandler)
  .put('/api/expenses/:id', updateExpenseHandler)
  .delete('/api/expenses/:id', removeExpenseHandler);
