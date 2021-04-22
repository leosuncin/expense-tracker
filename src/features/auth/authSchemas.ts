import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty().min(12),
});

export type LoginUser = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  name: z.string().nonempty().min(2),
});

export type RegisterUser = z.infer<typeof registerSchema>;
