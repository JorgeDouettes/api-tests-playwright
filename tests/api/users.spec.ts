import { buildUserPayload, expect, test, UserPayload } from './fixtures/users.fixture';

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

interface CreateUserResponse extends Required<UserPayload> {
  id: string;
  createdAt: string;
}

/**
 * Resposta do POST quando o payload vem incompleto.
 * A ReqRes não valida campos obrigatórios: ela ecoa apenas o que recebeu,
 * então `name` e `job` são opcionais aqui — e o campo ausente nem aparece no corpo.
 */
interface CreateUserPartialResponse {
  name?: string;
  job?: string;
  id: string;
  createdAt: string;
}

test.describe('GET /users/:id', () => {
  test('deve retornar 200 e os dados corretos do usuário quando o ID existe', async ({ api }) => {
    const user_id = 2;
    const status = 200;
    const email = 'janet.weaver@reqres.in';
    const first_name = 'Janet';
    const last_name = 'Weaver';
    const response = await api.getUser(user_id);

    expect(response.status()).toBe(status);
    const body: UserResponse = await response.json();
    expect(body.data.id).toBe(user_id);
    expect(body.data.email).toBe(email);
    expect(body.data.first_name).toBe(first_name);
    expect(body.data.last_name).toBe(last_name);
  });

  test('Deve retornar 404 quando o id não existe', async ({ api }) => {
    const user_id = 1231234;
    const status = 404;
    const response = await api.getUser(user_id);

    expect(response.status()).toBe(status);
    expect(response.url()).toContain(`users/${user_id}`);
    const body = await response.json();
    expect(body).toEqual({}); // Verifica se o json veio sem dados como esperado
  });
});

test.describe('Post para /users', () => {
  test('Deve retornar 201 ao criar usuário', async ({ api }) => {
    const payload = buildUserPayload();
    const response = await api.postUser(payload);

    const body: CreateUserResponse = await response.json();
    expect(response.status()).toBe(201);
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);

    expect(body.id).toEqual(expect.any(String));
    expect(Date.parse(body.createdAt)).not.toBeNaN();
  });

  test('Deve retornar 201 e omitir o job quando o payload vem incompleto', async ({ api }) => {
    const payload = buildUserPayload({ job: undefined });
    const response = await api.postUser(payload);

    expect(response.status()).toBe(201);
    const body: CreateUserPartialResponse = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body).not.toHaveProperty('job');

    expect(body.id).toEqual(expect.any(String));
    expect(Date.parse(body.createdAt)).not.toBeNaN();
  });

  test('Deve retornar 201 mesmo com payload vazio', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined, job: undefined });
    const response = await api.postUser(payload);

    expect(response.status()).toBe(201);
    const body: CreateUserPartialResponse = await response.json();
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('job');

    expect(body.id).toEqual(expect.any(String));
    expect(Date.parse(body.createdAt)).not.toBeNaN();
  });

  test('Deve retornar 201 mesmo faltando nome', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined });
    const response = await api.postUser(payload);

    expect(response.status()).toBe(201);
    const body: CreateUserPartialResponse = await response.json();
    expect(body).not.toHaveProperty('name');
    expect(body.id).toEqual(expect.any(String));
    expect(Date.parse(body.createdAt)).not.toBeNaN();
    expect(body.job).toBe(payload.job);
  });
});
