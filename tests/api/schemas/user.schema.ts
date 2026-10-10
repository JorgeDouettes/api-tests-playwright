import { z } from 'zod';

export const UserSchema = z.strictObject({
  id: z.number(),
  email: z.email(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.url(),
});

export const UserResponseSchema = z.strictObject({
  data: UserSchema, // ← reaproveita o schema de cima
  support: z.strictObject({
    url: z.url(),
    text: z.string(),
  }),
  _meta: z.unknown().optional(),
});
