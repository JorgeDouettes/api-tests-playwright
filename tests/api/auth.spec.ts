import { expect, test, buildCredentials } from './fixtures/reqres.fixture';
import {
  ErrorResponseSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
} from './schemas/auth.schema';

test.describe('POST /register', () => {
  test('Deve realizar o registro e retornar 200', async ({ api }) => {
    const payload = buildCredentials();
    const response = await api.register(payload);
    expect(response.status()).toBe(200);
    const body = RegisterResponseSchema.parse(await response.json());
    expect(body).toMatchObject({
      id: 4, // Ao realizar o get com o email escolhido, o id retornado foi 4
      token: 'QpwL5tke4Pnpja7X4', // O token é fixo, pois eh uma api mock
    });
  });

  test('Deve retornar 400 ao enviar somente email', async ({ api }) => {
    const payload = buildCredentials({ password: undefined });
    const response = await api.register(payload);
    expect(response.status()).toBe(400);
    const body = ErrorResponseSchema.parse(await response.json());
    expect(body.error).toBe('Missing password');
  });

  test('Deve retornar 400 ao enviar user sem registro', async ({ api }) => {
    const payload = buildCredentials({ email: 'qualquer@teste.com' });
    const response = await api.register(payload);
    expect(response.status()).toBe(400);
    const body = ErrorResponseSchema.parse(await response.json());
    expect(body.error).toBe('Note: Only defined users succeed registration');
  });
});

test.describe('POST /login', () => {
  test('Deve retornar 200 quando login estiver certo', async ({ api }) => {
    const payload = buildCredentials({ password: 'cityslicka' });
    const response = await api.login(payload);
    expect(response.status()).toBe(200);
    const body = LoginResponseSchema.parse(await response.json());
    expect(body.token).toBe('QpwL5tke4Pnpja7X4');
  });

  test('Deve retornar 400 quando o login estiver sem senha', async ({ api }) => {
    const payload = buildCredentials({ password: undefined });
    const response = await api.login(payload);
    expect(response.status()).toBe(400);
    const body = ErrorResponseSchema.parse(await response.json());
    expect(body.error).toBe('Missing password');
  });
});
