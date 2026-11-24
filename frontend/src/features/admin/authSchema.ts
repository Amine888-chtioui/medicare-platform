import { z } from 'zod';

export const loginSchema = (t: (key: string) => string) =>
  z.object({
    username: z.string().min(1, t('admin.login.errors.usernameRequired')).trim(),
    password: z.string().min(1, t('admin.login.errors.passwordRequired')),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
