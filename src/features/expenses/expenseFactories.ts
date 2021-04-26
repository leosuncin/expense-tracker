import * as Factory from 'factory.ts';
import * as faker from 'faker';

import type { CreateExpense } from '@app/features/expenses/expenseSchemas';
import type { ExpenseResponse as Expense } from '@app/pages/api/expenses/[[...id]]';

export const createExpenseFactory = Factory.Sync.makeFactory<CreateExpense>({
  name: faker.commerce.productName(),
  amount: Number.parseFloat(faker.commerce.price()),
  description: faker.commerce.productDescription(),
});

export const expenseFactory = Factory.Sync.makeFactory<Expense>({
  _id: Factory.each(() => faker.datatype.hexaDecimal(24)),
  __v: 0,
  name: faker.commerce.productName(),
  amount: Number.parseFloat(faker.commerce.price()),
  description: faker.commerce.productDescription(),
  author: Factory.each(() => faker.datatype.hexaDecimal(24)),
  createdAt: Factory.each(() => faker.date.past().toISOString()),
  updatedAt: Factory.each(() => faker.date.past().toISOString()),
});
