import { buildUserPayload, expect, test, UserPayload } from './fixtures/reqres.fixture';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UserResponse {
  data: User;
  support: { url: string; text: string };
  _meta?: unknown;
  avatar: { url: string };
}

interface CreateUserResponse extends Required<UserPayload> {
  id: string;
  createdAt: string;
  _meta?: unknown;
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
  _meta?: unknown;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

test.describe('GET /users/:id', () => {
  test('deve retornar 200 e os dados corretos do usuário quando o ID existe', async ({ api }) => {
    const userId = 2;
    const status = 200;
    const email = 'janet.weaver@reqres.in';
    const first_name = 'Janet';
    const last_name = 'Weaver';
    const response = await api.getUser(userId);

    expect(response.status()).toBe(status);
    const body: UserResponse = await response.json();
    const { _meta, ...semMeta } = body;

    expect(semMeta).toEqual({
      data: {
        id: userId,
        email: email,
        first_name: first_name,
        last_name: last_name,
        avatar: expect.stringMatching(/^https:\/\/.+\.jpg$/),
      },
      support: {
        url: expect.any(String),
        text: expect.any(String),
      },
    });
  });

  test('Deve retornar 404 quando o id não existe', async ({ api }) => {
    const userId = 1231234;
    const status = 404;
    const response = await api.getUser(userId);

    expect(response.status()).toBe(status);
    expect(response.url()).toContain(`users/${userId}`);
    const body = await response.json();
    expect(body).toEqual({}); // Verifica se o json veio sem dados como esperado
  });
});

test.describe('Post /users', () => {
  test('Deve retornar 201 ao criar usuário', async ({ api }) => {
    const payload = buildUserPayload();
    const response = await api.postUser(payload);
    const body: CreateUserResponse = await response.json();
    expect(response.status()).toBe(201);
    const { _meta, ...semMeta } = body;
    expect(response.status()).toBe(201);
    expect(semMeta).toEqual({
      ...payload,
      id: expect.any(String),
      createdAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });

  test('Deve retornar 201 e omitir o job quando o payload vem incompleto', async ({ api }) => {
    const payload = buildUserPayload({ job: undefined });
    const response = await api.postUser(payload);

    const body: CreateUserPartialResponse = await response.json();
    expect(response.status()).toBe(201);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      id: expect.any(String),
      createdAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });

  test('Deve retornar 201 mesmo com payload vazio', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined, job: undefined });
    const response = await api.postUser(payload);
    const body: CreateUserPartialResponse = await response.json();
    expect(response.status()).toBe(201);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      id: expect.any(String),
      createdAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });

  test('Deve retornar 201 mesmo faltando nome', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined });
    const response = await api.postUser(payload);
    const body: CreateUserPartialResponse = await response.json();
    expect(response.status()).toBe(201);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      id: expect.any(String),
      createdAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });
});
