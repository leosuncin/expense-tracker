import { z } from 'zod';

// Source https://stackoverflow.com/a/3143231
const isoDateRegex =
  /\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export const createExpenseSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z
    .number()
    .positive({ message: 'Amount needs to be a positive number' })
    .transform((value) => Math.round(value * 100) / 100),
  description: z
    .optional(z.string().min(1, { message: 'Description can not be empty' }))
    .nullable(),
  date: z
    .optional(
      z
        .date()
        .or(
          z
            .string()
            .regex(isoDateRegex, { message: 'Date has an invalid format' })
            .transform((value) => new Date(value)),
        )
        .refine((value) => value <= new Date(), {
          message: 'Date has to be in the past or today',
        }),
    )
    .nullable(),
});

export type CreateExpense = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();

export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
