// ---------------------------------------------------------------------------
// IMPORTS
// ---------------------------------------------------------------------------
// `test` vem renomeado para `base`: é o test ORIGINAL do Playwright, o ponto
// de partida que vamos ESTENDER logo abaixo. `expect` é o mesmo dos testes.
// `APIRequestContext` é só um TIPO (repare na palavra `type` antes dele) — ele
// descreve o objeto de requisição do Playwright (a fixture built-in `request`).
import { test as base, expect, type APIRequestContext } from '@playwright/test';

// ---------------------------------------------------------------------------
// PEÇA 1 — TIPO DO PAYLOAD (o que SAI no corpo da requisição)
// ---------------------------------------------------------------------------
// Descreve o corpo do POST /users. Os campos são OPCIONAIS (`?`) porque a
// ReqRes NÃO valida campos obrigatórios: ela aceita payload incompleto.
// Sendo opcional, este tipo consegue representar as 4 combinações testadas:
// {name,job} / {name} / {job} / {}.
export interface UserPayload {
  name?: string;
  job?: string;
}

// ---------------------------------------------------------------------------
// PEÇA 2 — DATA BUILDER (função que FABRICA payloads)
// ---------------------------------------------------------------------------
// `overrides: UserPayload = {}` -> parâmetro opcional; sem argumento vale {}.
// `): UserPayload`              -> tipo do RETORNO (função que devolve valor).
export function buildUserPayload(overrides: UserPayload = {}): UserPayload {
  return {
    // Baseline: um payload válido, para o teste não repetir estes valores.
    name: 'Jorge',
    job: 'Tester',
    // O spread vem DEPOIS dos defaults, então o que estiver em `overrides`
    // sobrescreve. E `{ job: undefined }` faz a chave desaparecer na
    // serialização JSON — é assim que simulamos "campo faltando".
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PEÇA 3 — CLIENTE DE API (transporte: dá nome aos endpoints)
// ---------------------------------------------------------------------------
// Embrulha o `request` do Playwright para os testes não repetirem paths.
// Não guarda estado. Devolve o APIResponse CRU: quem asserta é o teste.
export class ReqresAPI {
  // "parameter property": declara E atribui `this.request` numa linha só.
  // `private readonly` = visível só dentro da classe e não reatribuível.
  constructor(private readonly request: APIRequestContext) {}

  // GET /users/:id — o `:id` entra por template string.
  getUser(id: number) {
    return this.request.get(`users/${id}`);
  }

  // POST /users — recebe O OBJETO de payload (não campos soltos) para poder
  // expressar os casos incompletos. `{ data: payload }` faz o Playwright
  // serializar como JSON e enviar Content-Type: application/json.
  postUser(payload: UserPayload) {
    return this.request.post('users', { data: payload });
  }
}

// ---------------------------------------------------------------------------
// PEÇA 4 — CONTRATO DAS FIXTURES (quais valores são injetáveis e de que tipo)
// ---------------------------------------------------------------------------
// Mapa "nome da fixture -> tipo do valor entregue". É este tipo que dá ao
// `base.extend<...>` a informação para inferir os tipos de `request` e de
// `use` (e para cobrar que a implementação bata com a declaração).
type ReqresFixtures = {
  api: ReqresAPI;
};

// ---------------------------------------------------------------------------
// PEÇA 5 — FIXTURES (test.extend)
// ---------------------------------------------------------------------------
// Cria um `test` NOVO — o seu — estendido com as fixtures do tipo acima.
export const test = base.extend<ReqresFixtures>({
  // `api` depende da fixture built-in `request`, que JÁ traz o baseURL e o
  // header x-api-key do playwright.config.ts -> a autenticação vem de graça
  // e nenhum teste precisa saber que ela existe.
  // Setup = o que roda ANTES do `use`; teardown = o que roda DEPOIS dele.
  api: async ({ request }, use) => {
    await use(new ReqresAPI(request));
  },
});

// Reexporta o `expect` para os specs importarem `test` e `expect` do MESMO
// arquivo — senão eles usariam o `test` original, sem as fixtures novas.
export { expect };
