import * as Factory from 'factory.ts';
import * as faker from 'faker';

import type { CreateExpense } from '@app/features/expenses/expenseSchemas';

export const createExpenseFactory = Factory.Sync.makeFactory<CreateExpense>({
  name: faker.commerce.productName(),
  amount: Number.parseFloat(faker.commerce.price()),
  description: faker.commerce.productDescription(),
});
