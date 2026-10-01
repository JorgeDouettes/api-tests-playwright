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
