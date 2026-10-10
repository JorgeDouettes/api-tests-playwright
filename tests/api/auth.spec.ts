import { expect, test, buildCredentials } from './fixtures/reqres.fixture';

interface ResponseUser {
  id: number;
  token: string;
  _meta?: unknown;
}
interface ErrorResponse {
  error: string;
}

interface LoginUser {
  token: string;
  _meta?: unknown;
}
test.describe('POST /register', () => {
  test('Deve realizar o registro e retornar 200', async ({ api }) => {
    const payload = buildCredentials();
    const response = await api.register(payload);
    const body: ResponseUser = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      id: 4, // Ao realizar o get com o email escolhido, o id retornado foi 4
      token: 'QpwL5tke4Pnpja7X4', // O token é fixo, pois eh uma api mock
    });
  });
  test('Deve retornar 400 ao enviar somente email', async ({ api }) => {
    const payload = buildCredentials({ password: undefined });
    const response = await api.register(payload);
    const body: ErrorResponse = await response.json();
    expect(response.status()).toBe(400);
    expect(body).toEqual({
      error: 'Missing password',
    });
  });
  test('Deve retornar 400 ao enviar user sem registro', async ({ api }) => {
    const payload = buildCredentials({ email: 'qualquer@teste.com' });
    const response = await api.register(payload);
    const body: ErrorResponse = await response.json();
    expect(response.status()).toBe(400);
    expect(body).toEqual({
      error: 'Note: Only defined users succeed registration',
    });
  });
});

test.describe('POST /login', () => {
  test('Deve retornar 200 quando login estiver certo', async ({ api }) => {
    const payload = buildCredentials({ password: 'cityslicka' });
    const response = await api.login(payload);
    const body: LoginUser = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      token: 'QpwL5tke4Pnpja7X4',
    });
  });
  test('Deve retornar 400 quando o login estiver sem senha', async ({ api }) => {
    const payload = buildCredentials({ password: undefined });
    const response = await api.login(payload);
    const body: ErrorResponse = await response.json();
    expect(response.status()).toBe(400);
    expect(body).toEqual({
      error: 'Missing password',
    });
  });
});
