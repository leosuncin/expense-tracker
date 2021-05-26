import faker from 'faker';
import * as fc from 'fast-check';
import { ZodError } from 'zod';

import {
  CreateExpense,
  createExpenseSchema,
} from '@app/features/expenses/expenseSchemas';
import { fakerArbitrary } from '@app/utils/testUtils';

describe('Create Expense Schema', () => {
  it('parse required data', () => {
    fc.assert(
      fc.property(
        fc.record<CreateExpense>({
          name: fc.string({ minLength: 1 }),
          amount: fc.float({ min: 1, noNaN: true, noDefaultInfinity: true }),
        }),
        (data) => {
          const newExpense = createExpenseSchema.parse(data);

          expect(newExpense).toMatchObject<CreateExpense>({
            name: data.name,
            amount: data.amount,
          });
        },
      ),
    );
  });

  it('parse date value', () => {
    const today = new Date(new Date().toDateString());

    fc.assert(
      fc.property(
        fc.record({
          name: fakerArbitrary(faker.commerce.productName),
          amount: fakerArbitrary(faker.commerce.price).map((value) =>
            Number(value),
          ),
          description: fakerArbitrary(faker.commerce.productDescription),
          date: fc.oneof(
            fc.date({ max: today }),
            fc.date({ max: today }).map((value) => value.toISOString()),
          ),
        }),
        (data) => {
          const newExpense = createExpenseSchema.parse(data);

          expect(newExpense).toMatchObject<CreateExpense>({
            name: data.name,
            amount: data.amount,
            description: data.description,
            date: new Date(data.date),
          });
        },
      ),
    );
  });

  it('validate invalid data', () => {
    const tomorrow = new Date(new Date().toDateString());
    tomorrow.setDate(tomorrow.getDate() + 1);

    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          amount: fc.double({ max: 0 }),
          description: fc.string(),
          date: fc.oneof(fc.date({ min: tomorrow }), fc.string()),
        }),
        (data) => {
          expect(
            createExpenseSchema.parse.bind(createExpenseSchema, data),
          ).toThrow(ZodError);
        },
      ),
    );
  });
});
