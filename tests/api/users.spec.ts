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

interface UpdateResponse {
  name?: string;
  job?: string;
  updatedAt: string;
  _meta?: unknown;
}

interface UserListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
  support: { url: string; text: string };
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

test.describe('POST /users', () => {
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
test.describe('PUT /users/:id', () => {
  test('Deve retornar 200 com data de update', async ({ api }) => {
    const payload = buildUserPayload({ job: 'QA' });
    const response = await api.update(2, payload);
    const body: UpdateResponse = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      updatedAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });

  test('Deve retornar 200 e validar que a ReqRes ecoa somente o job mesmo sendo PUT', async ({
    api,
  }) => {
    const payload = buildUserPayload({ name: undefined, job: 'QA Senior' });
    const response = await api.update(2, payload);
    const body: UpdateResponse = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      updatedAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });
});

test.describe('PATCH /users/:id', () => {
  test('Deve retornar 200 e atualizar somente o job', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined, job: 'QA Senior' });
    const response = await api.parcialupdate(2, payload);
    const body: UpdateResponse = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      ...payload,
      updatedAt: expect.stringMatching(ISO_DATE_REGEX),
    });
  });
});

test.describe('DELETE /users/:id', () => {
  test('Deve retornar 204 e corpo vazio ao remover usuário', async ({ api }) => {
    const response = await api.remove(2);
    expect(response.status()).toBe(204);
    const body = await response.text();
    expect(body).toBe('');
  });
});

test.describe('GET /users?page=:page', () => {
  test('Deve retornar 200 e os usuários da página solicitada', async ({ api }) => {
    const page = 2;
    const response = await api.getpage(page);
    expect(response.status()).toBe(200);
    const body: UserListResponse = await response.json();
    const { _meta, ...semMeta } = body;

    // 1. Metadados da página; o conteúdo de `data` é validado abaixo
    expect(semMeta).toEqual({
      page,
      per_page: 6,
      total: 12,
      total_pages: 2,
      data: expect.any(Array),
      support: {
        url: expect.any(String),
        text: expect.any(String),
      },
    });

    // 2. A lista tem o tamanho que a própria API anunciou
    expect(body.data).toHaveLength(body.per_page);

    // 3. É a página certa: a página 2 traz os ids 7 a 12
    const ids = body.data.map((user) => user.id);
    expect(ids).toEqual([7, 8, 9, 10, 11, 12]);

    // 4. Cada usuário segue o schema de User
    for (const user of body.data) {
      expect(user).toEqual({
        id: expect.any(Number),
        email: expect.stringMatching(/@reqres\.in$/),
        first_name: expect.any(String),
        last_name: expect.any(String),
        avatar: expect.stringMatching(/^https:\/\/.+\.jpg$/),
      });
    }
  });
});
