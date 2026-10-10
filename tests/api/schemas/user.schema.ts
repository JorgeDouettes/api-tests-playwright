import { z } from 'zod';

export const UserSchema = z.strictObject({
  id: z.number(),
  email: z.email(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.url(),
});

const SupportSchema = z.strictObject({
  url: z.url(),
  text: z.string(),
});

export const UserResponseSchema = z.strictObject({
  data: UserSchema,
  support: SupportSchema,
  _meta: z.unknown().optional(),
});

export const UserListResponseSchema = z.strictObject({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  data: z.array(UserSchema),
  support: SupportSchema,
  _meta: z.unknown().optional(),
});
