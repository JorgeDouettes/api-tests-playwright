import { expect, test, buildCredentials } from './fixtures/reqres.fixture';

interface RegisterResponse {
  id: number;
  token: string;
  _meta?: unknown;
}

test.describe('POST /register', () => {
  test('Deve realizar o registro e retornar 200', async ({ api }) => {
    const payload = buildCredentials();
    const response = await api.register(payload);
    const body: RegisterResponse = await response.json();
    expect(response.status()).toBe(200);
    const { _meta, ...semMeta } = body;
    expect(semMeta).toEqual({
      id: 4, // Ao realizar o get com o email escolhido, o id retornado foi 4
      token: 'QpwL5tke4Pnpja7X4', // O token é fixo, pois eh uma api mock
    });
  });
});
