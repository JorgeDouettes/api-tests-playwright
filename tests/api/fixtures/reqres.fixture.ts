import { test as base, expect, type APIRequestContext } from '@playwright/test';

export interface UserPayload {
  name?: string;
  job?: string;
}

export interface CredentialsPayload {
  email?: string;
  password?: string;
}

export function buildUserPayload(overrides: UserPayload = {}): UserPayload {
  return {
    name: 'Jorge',
    job: 'Tester',
    ...overrides,
  };
}

export function buildCredentials(overrides: CredentialsPayload = {}): CredentialsPayload {
  return {
    email: 'eve.holt@reqres.in',
    password: 'pistol',
    ...overrides,
  };
}

export class ReqresAPI {
  constructor(private readonly request: APIRequestContext) {}
  getUser(id: number) {
    return this.request.get(`users/${id}`);
  }
  postUser(payload: UserPayload) {
    return this.request.post('users', { data: payload });
  }

  register(payload: CredentialsPayload) {
    return this.request.post('register', { data: payload });
  }

  login(payload: CredentialsPayload) {
    return this.request.post('login', { data: payload });
  }

  update(user: number, payload: UserPayload) {
    return this.request.put(`users/${user}`, { data: payload });
  }

  parcialupdate(user: number, payload: UserPayload) {
    return this.request.patch(`users/${user}`, { data: payload });
  }

  remove(id: number) {
    return this.request.delete(`users/${id}`);
  }

  getpage(page: number) {
    return this.request.get('users', { params: { page } });
  }
}

type ReqresFixtures = {
  api: ReqresAPI;
};

export const test = base.extend<ReqresFixtures>({
  api: async ({ request }, use) => {
    await use(new ReqresAPI(request));
  },
});

export { expect };
