import { test, expect } from '@playwright/test';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UserResponse {
  data: User;
}

interface CreateUserRequest {
  name: string;
  job: string;
}

interface CreateUserResponse extends CreateUserRequest {
  id: string;
  createdAt: string;
}

test.describe('GET /users/:id', () => {
  test('deve retornar 200 e os dados corretos do usuário quando o ID existe', async ({
    request,
  }) => {
    const user_id = 2;
    const status = 200;
    const email = 'janet.weaver@reqres.in';
    const first_name = 'Janet';
    const last_name = 'Weaver';
    const response = await request.get(`users/${user_id}`);

    expect(response.status()).toBe(status);
    const body: UserResponse = await response.json();
    expect(body.data.id).toBe(user_id);
    expect(body.data.email).toBe(email);
    expect(body.data.first_name).toBe(first_name);
    expect(body.data.last_name).toBe(last_name);
  });

  test('Deve retornar 404 quando o id não existe', async ({ request }) => {
    const user_id = 1231234;
    const status = 404;
    const response = await request.get(`users/${user_id}`);

    expect(response.status()).toBe(status);
    expect(response.url()).toContain(`users/${user_id}`);
    const body = await response.json();
    expect(body).toEqual({}); // Verifica se o json veio sem dados como esperado
  });
});

test.describe('Post para /users', () => {
  test('Deve retornar 201 ao criar usuário', async ({ request }) => {
    const name = 'Jorge';
    const job = 'Tester';
    const response = await request.post('users', {
      data: { name, job },
    });

    const body: CreateUserResponse = await response.json();
    expect(response.status()).toBe(201);
    expect(body.name).toBe(name);
    expect(body.job).toBe(job);

    expect(body.id).toEqual(expect.any(String));
    expect(Date.parse(body.createdAt)).not.toBeNaN();
  });
});
