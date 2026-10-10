import { buildUserPayload, expect, test } from './fixtures/reqres.fixture';
import {
  CreateUserResponseSchema,
  UpdateUserResponseSchema,
  UserListResponseSchema,
  UserResponseSchema,
} from './schemas/user.schema';

test.describe('GET /users/:id', () => {
  test('deve retornar 200 e os dados corretos do usuário quando o ID existe', async ({ api }) => {
    const userId = 2;
    const status = 200;
    const email = 'janet.weaver@reqres.in';
    const first_name = 'Janet';
    const last_name = 'Weaver';
    const response = await api.getUser(userId);

    expect(response.status()).toBe(status);
    const body = UserResponseSchema.parse(await response.json());
    expect(body.data).toMatchObject({ id: userId, email, first_name, last_name });
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
    expect(response.status()).toBe(201);
    const body = CreateUserResponseSchema.parse(await response.json());
    const { _meta, id, createdAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });

  test('Deve retornar 201 e omitir o job quando o payload vem incompleto', async ({ api }) => {
    const payload = buildUserPayload({ job: undefined });
    const response = await api.postUser(payload);

    expect(response.status()).toBe(201);
    const body = CreateUserResponseSchema.parse(await response.json());
    const { _meta, id, createdAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });

  test('Deve retornar 201 mesmo com payload vazio', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined, job: undefined });
    const response = await api.postUser(payload);
    expect(response.status()).toBe(201);
    const body = CreateUserResponseSchema.parse(await response.json());
    const { _meta, id, createdAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });

  test('Deve retornar 201 mesmo faltando nome', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined });
    const response = await api.postUser(payload);
    expect(response.status()).toBe(201);
    const body = CreateUserResponseSchema.parse(await response.json());
    const { _meta, id, createdAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });
});
test.describe('PUT /users/:id', () => {
  test('Deve retornar 200 com data de update', async ({ api }) => {
    const payload = buildUserPayload({ job: 'QA' });
    const response = await api.update(2, payload);
    expect(response.status()).toBe(200);
    const body = UpdateUserResponseSchema.parse(await response.json());
    const { _meta, updatedAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });

  test('Deve retornar 200 e validar que a ReqRes ecoa somente o job mesmo sendo PUT', async ({
    api,
  }) => {
    const payload = buildUserPayload({ name: undefined, job: 'QA Senior' });
    const response = await api.update(2, payload);
    expect(response.status()).toBe(200);
    const body = UpdateUserResponseSchema.parse(await response.json());
    const { _meta, updatedAt, ...eco } = body;
    expect(eco).toEqual(payload);
  });
});

test.describe('PATCH /users/:id', () => {
  test('Deve retornar 200 e atualizar somente o job', async ({ api }) => {
    const payload = buildUserPayload({ name: undefined, job: 'QA Senior' });
    const response = await api.parcialupdate(2, payload);
    expect(response.status()).toBe(200);
    const body = UpdateUserResponseSchema.parse(await response.json());
    const { _meta, updatedAt, ...eco } = body;
    expect(eco).toEqual(payload);
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
    // 1. Formato: metadados e cada usuário da lista seguem o schema
    const body = UserListResponseSchema.parse(await response.json());

    // 2. Metadados da página
    expect(body).toMatchObject({ page, per_page: 6, total: 12, total_pages: 2 });

    // 3. A lista tem o tamanho que a própria API anunciou
    expect(body.data).toHaveLength(body.per_page);

    // 4. É a página certa: a página 2 traz os ids 7 a 12
    const ids = body.data.map((user) => user.id);
    expect(ids).toEqual([7, 8, 9, 10, 11, 12]);
  });
});
