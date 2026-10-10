# Testes de API com Playwright + TypeScript

[![Testes de API](https://github.com/JorgeDouettes/api-tests-playwright/actions/workflows/tests.yml/badge.svg)](https://github.com/JorgeDouettes/api-tests-playwright/actions/workflows/tests.yml)

Suíte de testes automatizados para a API pública [ReqRes](https://reqres.in), escrita com o
test runner do **Playwright** para testes de API (sem navegador), **TypeScript** e validação
de contrato com **Zod**. Roda a cada push via **GitHub Actions**.

## Stack

| Ferramenta                                | Uso                                                |
| ----------------------------------------- | -------------------------------------------------- |
| [Playwright Test](https://playwright.dev) | runner e cliente HTTP (`APIRequestContext`)        |
| TypeScript                                | tipagem e `typecheck` como etapa da pipeline       |
| [Zod](https://zod.dev)                    | schemas de resposta validados em tempo de execução |
| Prettier                                  | formatação padronizada, verificada no CI           |
| GitHub Actions                            | execução da suíte a cada push e pull request       |

## Cobertura

16 cenários, positivos e negativos:

| Endpoint                | Cenários                                                                      |
| ----------------------- | ----------------------------------------------------------------------------- |
| `GET /users/:id`        | usuário existente (200) · usuário inexistente (404)                           |
| `GET /users?page=:page` | metadados da página, tamanho da lista, ids da página e schema de cada usuário |
| `POST /users`           | payload completo · sem `job` · sem `name` · payload vazio                     |
| `PUT /users/:id`        | atualização completa · atualização parcial (ver achados)                      |
| `PATCH /users/:id`      | atualização parcial                                                           |
| `DELETE /users/:id`     | 204 com corpo vazio                                                           |
| `POST /register`        | credenciais válidas · sem senha (400) · usuário não cadastrado (400)          |
| `POST /login`           | credenciais válidas · sem senha (400)                                         |

## Como rodar

Pré-requisitos: Node.js LTS e uma chave gratuita da ReqRes ([app.reqres.in/api-keys](https://app.reqres.in/api-keys)).

```bash
git clone https://github.com/JorgeDouettes/api-tests-playwright.git
cd api-tests-playwright
npm ci
```

Crie um arquivo `.env` na raiz (ele está no `.gitignore` e nunca é versionado):

```
REQRES_API_KEY=sua_chave_aqui
```

| Comando            | O que faz                                          |
| ------------------ | -------------------------------------------------- |
| `npm run check`    | typecheck + formatação + testes (o mesmo que o CI) |
| `npm run test:api` | só os testes de API                                |
| `npm run report`   | abre o relatório HTML da última execução           |
| `npm run format`   | formata o código com o Prettier                    |

## Estrutura

```
tests/api/
├── fixtures/
│   └── reqres.fixture.ts   # cliente da API, data builders e fixture `api`
├── schemas/
│   ├── user.schema.ts      # contratos de /users
│   └── auth.schema.ts      # contratos de /register e /login
├── users.spec.ts
└── auth.spec.ts
.github/workflows/tests.yml # pipeline de CI
```

## Decisões de design

**Fixture customizada com um cliente da API.** Os testes não chamam `request.get('users/2')`
diretamente: recebem uma fixture `api` (criada com `test.extend`) que expõe métodos como
`getUser(id)` e `register(payload)`. Os caminhos ficam num lugar só, e a autenticação
(`baseURL` e header `x-api-key`) vem do `playwright.config.ts`, sem que nenhum teste precise
conhecê-la.

**Data builders com overrides.** Os payloads saem de funções como `buildUserPayload()`, que
devolvem um payload válido por padrão. Cada cenário altera só o que importa para ele, e
`undefined` remove o campo do JSON:

```ts
const payload = buildUserPayload({ name: undefined }); // simula "nome faltando"
```

**Formato com Zod, valores com `expect`.** Cada resposta passa primeiro por um schema
`z.strictObject`, que falha se faltar um campo, se um tipo estiver errado ou se aparecer uma
chave não prevista. Depois, o `expect` verifica só os valores do cenário:

```ts
expect(response.status()).toBe(200);
const body = UserResponseSchema.parse(await response.json()); // formato
expect(body.data).toMatchObject({ id: 2, first_name: 'Janet' }); // valores
```

Os tipos do TypeScript são inferidos dos próprios schemas, então não existe uma interface
escrita à mão para manter sincronizada.

**Status antes do schema.** Se a API devolver um 500, o erro reportado é "esperava 200,
recebeu 500", e não uma falha de schema sobre um corpo que nem deveria ser analisado.

**Valor exato quando é contrato, matcher quando é detalhe.** O `id` devolvido no registro da
Eve é fixo porque faz parte do contrato (é o id dela). Datas como `createdAt` são validadas
pelo formato (`z.iso.datetime()`), porque o valor muda a cada execução.

**Fail-fast na configuração.** Sem `REQRES_API_KEY`, o `playwright.config.ts` interrompe a
execução com uma mensagem clara, em vez de deixar a suíte falhar com 401/403 em cada teste.

## Achados

Comportamentos da ReqRes identificados durante a exploração e documentados nos testes:

1. **`POST /users` não valida campos obrigatórios.** Payload sem `name`, sem `job` ou vazio
   recebe `201 Created`. A API só ecoa o que recebeu e acrescenta `id` e `createdAt`.
2. **`PUT` e `PATCH` têm o mesmo comportamento.** Um `PUT` com apenas `{ job }` deveria
   substituir o recurso inteiro, mas devolve exatamente o mesmo que um `PATCH`: só o `job`
   e o `updatedAt`. O cenário de PUT parcial existe para documentar isso.
3. **O token de autenticação é estático.** `/register` e `/login` devolvem sempre o mesmo
   token, em vez de um token por sessão. Esperado numa API de mock, mas inviável num sistema
   real.
4. **Contratos diferentes entre `/register` e `/login`.** O registro devolve `{ id, token }`,
   e o login devolve apenas `{ token }`.
5. **Respostas de sucesso trazem um campo `_meta`** com metadados da plataforma, ausente nas
   respostas de erro. Os schemas aceitam o `_meta` como opcional e não validam seu conteúdo,
   por não fazer parte do contrato dos recursos.
6. **`GET /users/:id` inexistente devolve `404` com corpo `{}`**, e `DELETE` devolve `204`
   com corpo vazio (verificado com `response.text()`, já que `response.json()` falharia).

## CI

O workflow [`.github/workflows/tests.yml`](.github/workflows/tests.yml) roda em cada push e
pull request para a `main`: instala as dependências com `npm ci`, executa `npm run check` com a
chave da API vinda dos **GitHub Secrets** e publica o relatório do Playwright como artefato,
inclusive quando há falhas.
