import * as z from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .email('Email needs to be a valid address'),
  password: z
    .string()
    .nonempty('Password is required')
    .min(12, 'Password has to be at least 12 characters')
    .max(32, 'Password can have as much as 32 characters'),
});

export type LoginUser = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .nonempty('Name is required')
    .min(2, 'Name has to be at least 2 letters'),
});

export type RegisterUser = z.infer<typeof registerSchema>;
