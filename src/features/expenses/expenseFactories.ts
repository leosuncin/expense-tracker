import * as Factory from 'factory.ts';
import * as faker from 'faker';

import type { ExpenseJson as Expense } from '@app/features/expenses/Expense';
import type { CreateExpense } from '@app/features/expenses/expenseSchemas';

export const createExpenseFactory = Factory.Sync.makeFactory<CreateExpense>({
  name: faker.commerce.productName(),
  amount: Number.parseFloat(faker.commerce.price()),
  description: faker.commerce.productDescription(),
});

export const expenseFactory = Factory.Sync.makeFactory<Expense>({
  id: Factory.each(() => faker.datatype.hexaDecimal(24)),
  name: faker.commerce.productName(),
  amount: Number.parseFloat(faker.commerce.price()),
  description: faker.commerce.productDescription(),
  date: Factory.each(() => faker.date.recent().toISOString()),
  author: Factory.each(() => faker.datatype.hexaDecimal(24)),
  createdAt: Factory.each(() => faker.date.past().toISOString()),
  updatedAt: Factory.each(() => faker.date.past().toISOString()),
});
