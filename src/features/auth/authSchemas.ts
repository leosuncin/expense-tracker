import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Email needs to be a valid address' }),
  password: z
    .string()
    .min(12, { message: 'Password has to be at least 12 characters' })
    .max(32, { message: 'Password can have as much as 32 characters' }),
});

export type LoginUser = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name has to be at least 2 letters' }),
});

export type RegisterUser = z.infer<typeof registerSchema>;
