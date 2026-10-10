import { z } from 'zod';

export const RegisterResponseSchema = z.strictObject({
  id: z.number(),
  token: z.string().min(1),
  _meta: z.unknown().optional(),
});

export const LoginResponseSchema = z.strictObject({
  token: z.string().min(1),
  _meta: z.unknown().optional(),
});

// Respostas de erro não trazem `_meta`
export const ErrorResponseSchema = z.strictObject({
  error: z.string(),
});
