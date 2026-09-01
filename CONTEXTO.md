# 📌 Contexto e Acompanhamento do Projeto: ValidaBauducco

> **Documento de Contexto Vivo**: Este documento é atualizado a cada etapa do projeto para registrar decisões de arquitetura, regras de negócio, status atual de desenvolvimento e os próximos passos.

---

## 🎯 1. Visão Geral do Produto
O **ValidaBauducco** é um sistema completo composto por uma **API Backend** e um aplicativo **Mobile (React Native/Expo)** projetado para franquias da **Casa Bauducco**, com foco na prevenção de perdas financeiras por produtos vencidos e na automação do controle de validade e reposição de prateleiras.

### 🔑 Regra Central do Negócio:
- **1 Produto : N Lotes**: Cada produto possui um **código de barras (EAN)** único, nome e categoria.
- O que varia são os **lotes**: cada lote possui sua própria **data de validade**, **quantidade** e **status** (`ativo`, `vendido`, `descartado`).
- Todos os itens de um determinado lote possuem rigorosamente a mesma data de validade.

---

## 🚦 2. Semáforo e Marcos de Notificação de Vencimento
Calculado dinamicamente com base na diferença em dias entre a data atual (fuso `America/Sao_Paulo`) e a `dataValidade` do lote:

| Marco | Urgência | Status Visual | Regra (`diasRestantes`) | Ação / Notificação |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **VENCIDO / 3 DIAS** | `CRITICO` | Vermelho (`#E53935`) | `diasRestantes <= 3` (inclui `< 0`) | Alerta Crítico / Emergência de venda ou descarte |
| 🟠 **10 DIAS** | `ALERTA_10D` | Laranja (`#FB8C00`) | `4 <= diasRestantes <= 10` | Alerta Imediato / Ação rápida no PDV |
| 🟡 **20 DIAS** | `ALERTA_20D` | Amarelo (`#FBC02D`) | `11 <= diasRestantes <= 20` | Atenção Operacional / Priorizar reposição |
| 🔵 **1 MÊS (30 DIAS)** | `ALERTA_1M` | Azul (`#1E88E5`) | `21 <= diasRestantes <= 30` | Alerta Preventivo / Planejar ações de venda |
| 🟣 **2 MESES (60 DIAS)** | `ALERTA_2M` | Roxo (`#8E24AA`) | `31 <= diasRestantes <= 60` | Planejamento de Giro de Estoque |
| 🟢 **NORMAL / SEGURO** | `NORMAL` | Verde (`#43A047`) | `diasRestantes > 60` | Validade segura (+2 meses) |

---

## 🛠️ 3. Stack Tecnológica Definida

### Backend:
- **Runtime:** Node.js v22 (com `npm`)
- **Linguagem:** TypeScript (modo `strict: true`)
- **Framework Web:** Fastify v5
- **Autenticação:** JWT (`@fastify/jwt`) + hash de senha com `bcryptjs`
- **Banco de Dados:** PostgreSQL (hospedado no Neon Serverless)
- **ORM:** Prisma ORM v6
- **Validação de Schemas:** Zod
- **Manipulação de Datas:** Day.js (com timezone `America/Sao_Paulo` e plugin `utc`)
- **Agendador de Tarefas:** `node-cron`
- **Notificações Push:** Expo Server SDK (`expo-server-sdk`)
- **Documentação de API:** Swagger / OpenAPI (`@fastify/swagger` + `@fastify/swagger-ui` em `/docs`)
- **Testes Automatizados:** Vitest (29 testes unitários e E2E - 100% passando)

### Frontend Mobile (React Native / Expo):
- **Framework & Roteamento:** Expo SDK 54 com **Expo Router v6** (TypeScript)
- **Design System & Paleta Casa Bauducco:**
  - Primária (Dourado/Mostarda): `#D48B06` / `#A86B00`
  - Secundária (Marrom Café): `#3D1E10` / `#261108`
  - Fundo Geral: Off-white `#F9F8F5` | Cards: Branco Puro `#FFFFFF`
  - Semáforo dos 5 Marcos: 🔴 Vermelho, 🟠 Laranja, 🟡 Amarelo, 🔵 Azul, 🟣 Roxo, 🟢 Verde
- **Navegação em 4 Abas (Bottom Tabs):**
  1. 🏠 **Dashboard:** Cards dos 5 marcos de validade, filtros por criticidade, lista de lotes, baixa rápida e exclusão.
  2. 📷 **Scanner (Aba Central Destacada):** Leitor de código de barras em tempo real com `expo-camera` e feedback tátil (`expo-haptics`).
  3. 📦 **Estoque / Produtos:** Catálogo geral com busca em tempo real por nome/EAN.
  4. 👤 **Perfil:** Informações do operador, filial, teste de push e botão de Logout.
- **Fluxos Operacionais Principais:**
  - Leitura de EAN existente ➔ Exibe produto e seus lotes + formulário de "Novo Lote".
  - Leitura de EAN inexistente (404) ➔ Abre tela de "Novo Produto" com EAN pré-preenchido.
  - Baixa rápida de lote ➔ Modal intuitivo com botões de "Vendido", "Descartado" e "Excluir Registro".
- **Gerenciamento de Estado & Conexão:** Context API (`AuthContext`), `expo-secure-store` e `Axios`.
- **Compatibilidade de Área Segura:** `react-native-safe-area-context` em todas as telas.

---

## 🗄️ 4. Modelagem do Banco de Dados (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OPERATOR
  ADMIN
}

enum StatusLote {
  ativo
  vendido
  descartado
}

model Loja {
  id        String    @id @default(uuid())
  nome      String
  cnpj      String?   @unique
  criadoEm  DateTime  @default(now()) @map("criado_em")

  usuarios  Usuario[]
  produtos  Produto[]

  @@map("lojas")
}

model Usuario {
  id        String   @id @default(uuid())
  lojaId    String?  @map("loja_id")
  nome      String
  email     String   @unique
  senhaHash String   @map("senha_hash")
  role      Role     @default(OPERATOR)
  criadoEm  DateTime @default(now()) @map("criado_em")

  loja      Loja?    @relation(fields: [lojaId], references: [id], onDelete: SetNull)

  @@map("usuarios")
}

model Produto {
  id           String   @id @default(uuid())
  lojaId       String?  @map("loja_id")
  codigoBarras String   @unique @map("codigo_barras")
  nome         String
  categoria    String?
  criadoEm     DateTime @default(now()) @map("criado_em")
  atualizadoEm DateTime @updatedAt @map("atualizado_em")

  loja         Loja?    @relation(fields: [lojaId], references: [id], onDelete: Cascade)
  lotes        Lote[]

  @@map("produtos")
}

model Lote {
  id           String     @id @default(uuid())
  produtoId    String     @map("produto_id")
  numeroLote   String?    @map("numero_lote")
  dataValidade DateTime   @map("data_validade") @db.Date
  quantidade   Int        @default(1)
  status       StatusLote @default(ativo)
  criadoEm     DateTime   @default(now()) @map("criado_em")
  atualizadoEm DateTime   @updatedAt @map("atualizado_em")

  produto      Produto    @relation(fields: [produtoId], references: [id], onDelete: Cascade)

  @@index([dataValidade, status])
  @@map("lotes")
}

model DispositivoToken {
  id        String   @id @default(uuid())
  token     String   @unique
  criadoEm  DateTime @default(now()) @map("criado_em")

  @@map("dispositivos_tokens")
}
```

---

## 📡 5. Contratos de Rotas da API (REST)

### Autenticação & Usuários:
- `POST /api/auth/register` - Cadastro de novo usuário
- `POST /api/auth/login` - Autenticação e emissão de JWT
- `GET /api/auth/me` - Dados do usuário autenticado (requer JWT)

### Produtos:
- `POST /api/produtos` - Cadastro / Upsert de produto por código de barras
- `GET /api/produtos` - Listagem de produtos com busca
- `GET /api/produtos/:id` - Detalhes do produto e seus lotes ativos
- `GET /api/produtos/barcode/:ean` - Detalhes do produto e seus lotes ativos com cálculo de semáforo
- `PUT /api/produtos/:id` - Atualização dos dados do produto
- `DELETE /api/produtos/:id` - Exclusão definitiva do produto e seus lotes

### Lotes:
- `POST /api/lotes` - Cadastro de lote para um produto
- `GET /api/lotes/dashboard` - Resumo agregado dos 5 marcos + lista ordenada por validade
- `PUT /api/lotes/:id` - Edição de dados do lote (número, validade, quantidade, status)
- `PATCH /api/lotes/:id/baixa` - Baixa no lote (`status`: "vendido" | "descartado")
- `DELETE /api/lotes/:id` - Exclusão definitiva de um lote

### Dispositivos & Push Notifications:
- `POST /api/dispositivos/token` - Registro de token Expo do dispositivo
- `DELETE /api/dispositivos/token/:token` - Remoção do token

### Rotinas Agendadas / Jobs:
- `POST /api/jobs/trigger-alerta-validade` - Disparo manual da varredura dos 5 marcos e push notification
- `Cron diário (08:00)` - Varredura automática e disparo de notificações

---

## 📊 6. Roadmap e Status de Execução

- [x] **Etapa 1: Estrutura Inicial do Backend & Dependências**
- [x] **Etapa 2: Prisma ORM e Modelagem do Banco**
- [x] **Etapa 3: Núcleo, Utilitários e Tratamento de Erros**
- [x] **Etapa 4: Módulo de Autenticação e Usuários**
- [x] **Etapa 5: Módulo de Produtos e Lotes**
- [x] **Etapa 6: Notificações Push & Jobs**
- [x] **Etapa 7: Documentação Swagger & Testes Automatizados (29 testes passando)**
- [x] **Etapa 8: Conexão do Banco de Dados Neon & Homologação**
- [x] **Etapa 9: Desenvolvimento do Aplicativo Mobile (`mobile/`)**
  - [x] 9.1: Inicialização do projeto Expo Router no diretório `mobile/`
  - [x] 9.2: Instalação de dependências (`expo-camera`, `expo-haptics`, `expo-secure-store`, `lucide-react-native`, `axios`)
  - [x] 9.3: Configuração de tema visual, cores da Casa Bauducco e API client (`src/services/api.ts`)
  - [x] 9.4: Camada de Autenticação (`AuthContext`, Telas de Login e Cadastro)
  - [x] 9.5: Layout de Navegação com Bottom Tabs (Dashboard, Scanner, Estoque, Perfil)
  - [x] 9.6: Tela de Dashboard com Cards dos 5 Marcos e Lista de Lotes
  - [x] 9.7: Tela de Scanner de Código de Barras com Câmera e feedback tátil
  - [x] 9.8: Telas de Produto & Novo Lote / Cadastro de Produto Novo
  - [x] 9.9: Modal de Ação Rápida de Baixa de Estoque (Vendido / Descartado) e Exclusão Definitiva
  - [x] 9.10: Alinhamento para Expo SDK 54, Área Segura em todas as telas e 18/18 checks no expo-doctor
- [x] **Etapa 10: Documentação Completa do Projeto (README raiz, backend/README e mobile/README)**
- [x] **Etapa 11: Preparação de Deploy do Backend em Nuvem e Build do APK Android (EAS Build)**
  - [x] 11.1: Ajuste dos scripts de build e start no `backend/package.json` (`prisma generate && tsup`, execução de `dist/server.cjs`)
  - [x] 11.2: Criação do arquivo de Blueprint `render.yaml` para deploy automatizado do backend no Render
  - [x] 11.3: Configuração do identificador de pacote nativo (`com.fatec.validabauducco`) e `versionCode` no `mobile/app.json`
  - [x] 11.4: Criação do arquivo de configuração do EAS Build `mobile/eas.json` com perfil `preview` para geração direta de `.apk`
  - [x] 11.5: Suporte a `EXPO_PUBLIC_API_URL` com fallback inteligente no client Axios `mobile/src/services/api.ts`
  - [x] 11.6: Validação de integridade do projeto mobile via `expo-doctor` (18/18 checks aprovados) e testes do backend (29/29 testes passando)

