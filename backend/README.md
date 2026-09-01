# ⚙️ ValidaBauducco — API Backend

> API RESTful desenvolvida com **Fastify v5**, **TypeScript estrito**, **Prisma ORM v6** e **PostgreSQL Serverless no Neon**, responsável pelas regras de negócio, cálculo do semáforo dos 5 marcos de validade, autenticação JWT e agendamento de notificações push.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js**: v22 LTS
* **Fastify v5**: Framework HTTP de alta performance
* **TypeScript**: Modo estrito (`strict: true`) com aliases `@/*`
* **Prisma ORM v6**: Mapeamento objeto-relacional e migrações
* **PostgreSQL (Neon Serverless)**: Banco de dados em nuvem
* **@fastify/jwt**: Emissão e validação de tokens JWT
* **bcryptjs**: Hashing seguro de senhas
* **Zod**: Validação de esquemas e variáveis de ambiente
* **Day.js**: Cálculos de datas com fuso horário `America/Sao_Paulo`
* **node-cron**: Agendamento de varredura diária às 08:00
* **expo-server-sdk**: Envio de notificações push para dispositivos móveis
* **Swagger / OpenAPI**: `@fastify/swagger` + `@fastify/swagger-ui` em `/docs`
* **Vitest**: Testes unitários e testes E2E com cobertura completa

---

## 🗄️ Modelagem de Dados (Prisma Schema)

```text
Loja (1) ──── (N) Usuario
  │
 (1)
  │
 (N)
Produto (1) ──── (N) Lote

DispositivoToken (registro de tokens push do Expo)
```

---

## 🚦 Cálculo de Semáforo e Marcos de Validade

O utilitário `src/utils/traffic-light.ts` calcula a diferença exata em dias corridos entre a data atual em São Paulo e a data de validade do lote:

```typescript
export function calcularCriticidadeValidade(dataValidade: string | Date): ResultadoCriticidade {
  // diasRestantes = dataValidade - hoje
  // <= 3 dias: CRITICO (Vermelho)
  // 4 a 10 dias: ALERTA_10D (Laranja)
  // 11 a 20 dias: ALERTA_20D (Amarelo)
  // 21 a 30 dias: ALERTA_1M (Azul)
  // 31 a 60 dias: ALERTA_2M (Roxo)
  // > 60 dias: NORMAL (Verde)
}
```

---

## 📡 Endpoints da API

### 🔐 Autenticação (`/api/auth`)
* `POST /api/auth/register` — Cadastra um novo operador ou gerente
* `POST /api/auth/login` — Autentica o usuário e retorna o token JWT
* `GET /api/auth/me` — Retorna os dados do perfil autenticado

### 📦 Produtos (`/api/produtos`)
* `POST /api/produtos` — Cadastra ou atualiza um produto por código de barras (EAN)
* `GET /api/produtos` — Lista produtos com filtro de busca por nome/código
* `GET /api/produtos/:id` — Retorna os dados do produto e seus lotes ativos
* `GET /api/produtos/barcode/:ean` — Busca produto pelo código EAN e calcula o semáforo
* `PUT /api/produtos/:id` — Atualiza informações do produto
* `DELETE /api/produtos/:id` — Exclui definitivamente um produto e todos os seus lotes

### 🏷️ Lotes (`/api/lotes`)
* `POST /api/lotes` — Cadastra um novo lote vinculado a um produto
* `GET /api/lotes/dashboard` — Retorna métricas agregadas dos 5 marcos e lista ordenada
* `PUT /api/lotes/:id` — Atualiza dados do lote
* `PATCH /api/lotes/:id/baixa` — Registra saída do estoque (`status`: `vendido` | `descartado`)
* `DELETE /api/lotes/:id` — Exclui definitivamente um lote do banco

### 📲 Dispositivos (`/api/dispositivos`)
* `POST /api/dispositivos/token` — Registra token push do Expo para a loja
* `DELETE /api/dispositivos/token/:token` — Remove o token

### ⏰ Jobs & Automações (`/api/jobs`)
* `POST /api/jobs/trigger-alerta-validade` — Dispara manualmente a varredura e envio de push

---

## 🏃 Como Rodar o Backend

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env`:
   ```env
   NODE_ENV="development"
   PORT=3333
   HOST="0.0.0.0"
   DATABASE_URL="sua-url-do-postgresql-neon"
   JWT_SECRET="sua-chave-secreta-jwt"
   TZ="America/Sao_Paulo"
   ```

3. Inicie em modo de desenvolvimento (com hot-reload):
   ```bash
   npm run dev
   ```

4. Acesse a documentação interativa:
   **[http://localhost:3333/docs](http://localhost:3333/docs)**

---

## 🧪 Execução de Testes Automatizados

```bash
npm test
```

Para rodar em modo watch contínuo:
```bash
npm run test:watch
```

---

## ☁️ Deploy do Backend em Produção (Render / Railway)

### Opção 1: Render.com (Recomendado — Gratuito)
1. Acesse [render.com](https://render.com) e conecte sua conta do GitHub.
2. Crie um novo **Web Service** apontando para este repositório.
3. Defina as seguintes configurações:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
4. Adicione as **Environment Variables**:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: `sua_url_neon`
   * `JWT_SECRET`: `sua_chave_jwt`
   * `TZ`: `America/Sao_Paulo`
5. Clique em **Create Web Service**. A API estará no ar com HTTPS automático e endpoint Swagger em `/docs`!

