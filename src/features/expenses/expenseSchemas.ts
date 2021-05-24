import * as z from 'zod';

export const createExpenseSchema = z.object({
  name: z.string().nonempty('Name is required'),
  amount: z.number().positive('Amount needs to be a positive number'),
  description: z.union([
    z.string().nonempty('Description can not be empty'),
    z.null(),
    z.undefined(),
  ]),
  date: z.union([
    z.date().refine((value) => value <= new Date(), {
      message: 'Date needs to be in the past or today',
    }),
    z.null(),
    z.undefined(),
  ]),
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();

export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
