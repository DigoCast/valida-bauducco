# 🍞 ValidaCB — Sistema de Controle de Validades e Prevenção de Perdas

> Aplicativo Mobile e API Backend desenvolvidos para franquias da **Rede CB**, focados na automação do monitoramento de validades, controle de giro de estoque e prevenção de perdas de produtos perecíveis.

---

## 📋 Índice
- [Visão Geral e Proposta de Valor](#-visão-geral-e-proposta-de-valor)
- [Regras de Negócio e Semáforo de Validades](#-regras-de-negócio-e-semáforo-de-validades)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [1. Configuração e Inicialização do Backend](#1-configuração-e-inicialização-do-backend)
  - [2. Configuração e Inicialização do Mobile](#2-configuração-e-inicialização-do-mobile)
- [Documentação da API (Swagger)](#-documentação-da-api-swagger)
- [Testes Automatizados](#-testes-automatizados)
- [Licença](#-licença)

---

## 🎯 Visão Geral e Proposta de Valor

Em lojas e franquias da Rede CB, produtos como Panettones, Biscoitos Artesanais, Bolos e Chocolates possuem prazos de validade específicos por lote de fabricação. 

O **ValidaCB** resolve a dificuldade do controle manual em prateleiras através de:
1. **Leitura Instantânea de Código de Barras (EAN):** Identificação ágil do produto na entrada ou auditoria de estoque.
2. **Dashboard Visual com 5 Marcos de Validade:** Notificação e semáforo colorido preventivo antes que os produtos vençam.
3. **Baixa Rápida de Estoque:** Registro imediato de saídas (*Vendido* ou *Descartado*) e exclusão definitiva de lotes.
4. **Notificações Push Diárias:** Alertas automáticos disparados às 08:00 para os operadores da loja.

---

## 🚦 Regras de Negócio e Semáforo de Validades

### Relação de Entidades:
* **1 Produto : N Lotes:** Cada produto possui um código de barras (EAN) único no sistema. O que varia entre as remessas são os **lotes**, cada um com sua data de validade, quantidade e status.

### Os 5 Marcos de Validade:

| Marco | Nível de Urgência | Cor do Semáforo | Regra (`diasRestantes`) | Ação Operacional Recomendada |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **VENCIDO / 3 DIAS** | `CRITICO` | Vermelho (`#E53935`) | `diasRestantes <= 3` (inclui vencidos) | Ação imediata / Descarte ou promoção relâmpago |
| 🟠 **10 DIAS** | `ALERTA_10D` | Laranja (`#FB8C00`) | `4 <= diasRestantes <= 10` | Priorizar exposição na frente da gôndola |
| 🟡 **20 DIAS** | `ALERTA_20D` | Amarelo (`#FBC02D`) | `11 <= diasRestantes <= 20` | Atenção operacional de reposição |
| 🔵 **1 MÊS (30 DIAS)** | `ALERTA_1M` | Azul (`#1E88E5`) | `21 <= diasRestantes <= 30` | Alerta preventivo e planejamento de giro |
| 🟣 **2 MESES (60 DIAS)** | `ALERTA_2M` | Roxo (`#8E24AA`) | `31 <= diasRestantes <= 60` | Planejamento comercial de estoque |
| 🟢 **SEGURO** | `NORMAL` | Verde (`#43A047`) | `diasRestantes > 60` | Validade segura (+2 meses de prazo) |

---

## 🏗️ Arquitetura do Projeto

```mermaid
graph TD
    subgraph Mobile ["📱 App Mobile (React Native + Expo SDK 54)"]
        UI["Interface Rede CB"]
        Router["Expo Router (Abas & Telas)"]
        Cam["Expo Camera (Leitor EAN)"]
        Store["Expo SecureStore (JWT)"]
    end

    subgraph Backend ["⚙️ API Backend (Fastify + TypeScript)"]
        Routes["Rotas REST & Swagger UI"]
        Auth["JWT & Bcrypt Security"]
        Cron["Cron Job Diário (08:00)"]
        Prisma["Prisma ORM v6"]
    end

    subgraph Database ["☁️ Banco de Dados Serverless"]
        Neon[("PostgreSQL Neon")]
    end

    UI --> Router
    Router --> Cam
    Router --> Store
    Router -- "Requisições HTTP / JSON" --> Routes
    Routes --> Auth
    Routes --> Prisma
    Cron --> Prisma
    Prisma --> Neon
```

---

## 🛠️ Stack Tecnológica

### Backend:
* **Linguagem & Runtime:** Node.js v22 LTS + TypeScript (Modo `strict: true`)
* **Framework HTTP:** Fastify v5
* **Banco de Dados:** PostgreSQL Serverless ([Neon](https://neon.tech))
* **ORM:** Prisma ORM v6
* **Autenticação:** JWT (`@fastify/jwt`) + `bcryptjs`
* **Validação de Dados:** Zod
* **Datas & Timezone:** Day.js com timezone `America/Sao_Paulo`
* **Agendador Cron:** `node-cron`
* **Push Notifications:** Expo Server SDK (`expo-server-sdk`)
* **Documentação OpenAPI:** Swagger UI (`@fastify/swagger` + `@fastify/swagger-ui`)
* **Testes Automatizados:** Vitest (29 testes unitários e E2E)

### Mobile:
* **Framework:** React Native + Expo SDK 54
* **Roteamento:** Expo Router v6 (File-based routing)
* **Scanner:** `expo-camera` com retículo visual e lanterna
* **Feedback Tátil:** `expo-haptics`
* **Armazenamento Seguro:** `expo-secure-store`
* **Ícones:** `lucide-react-native` + `react-native-svg`
* **Área Segura:** `react-native-safe-area-context`
* **Cliente HTTP:** Axios com interceptor de autenticação e fallback de IP

---

## 📁 Estrutura do Repositório

```text
valida-cb/
├── backend/                  # API REST Fastify + Prisma + Neon
│   ├── prisma/               # Schema e Migrações do PostgreSQL
│   ├── src/
│   │   ├── config/           # Variáveis de ambiente validadas com Zod
│   │   ├── controllers/      # Controladores de rotas REST
│   │   ├── errors/           # Classes de erros e ErrorHandler global
│   │   ├── jobs/             # Agendador de tarefas cron diárias
│   │   ├── lib/              # Singletons (Prisma, Dayjs, Expo SDK)
│   │   ├── middlewares/      # Middleware de verificação JWT
│   │   ├── repositories/     # Camada de acesso a dados (Prisma)
│   │   ├── routes/           # Definição e schemas OpenAPI das rotas
│   │   ├── services/         # Regras de negócio e cálculo de marcos
│   │   └── utils/            # Utilitários de data e semáforo
│   ├── test/                 # Testes unitários e E2E com Vitest
│   └── README.md             # Documentação específica do backend
│
├── mobile/                   # Aplicativo React Native com Expo
│   ├── app/                  # Rotas do Expo Router
│   │   ├── (auth)/           # Telas de Login e Cadastro
│   │   ├── (tabs)/           # 4 Abas (Dashboard, Scanner, Estoque, Perfil)
│   │   ├── produto/          # Detalhes, Histórico e Cadastro de Produto
│   │   └── _layout.tsx       # Layout raiz com AuthProvider e Safe Area
│   ├── src/
│   │   ├── components/       # Cards de Lote, Métricas, Header e Modais
│   │   ├── constants/        # Cores e Semáforo
│   │   ├── contexts/         # AuthContext com sessão persistida
│   │   ├── services/         # Conexão com a API (Axios) e Notificações
│   │   ├── types/            # Interfaces TypeScript
│   │   └── utils/            # Armazenamento SecureStore
│   └── README.md             # Documentação específica do mobile
│
├── CONTEXTO.md               # Documento de Contexto Vivo e Histórico
└── README.md                 # Visão geral do projeto (este arquivo)
```

---

## ⚙️ Pré-requisitos

* **Node.js**: Versão 22 ou superior instalada ([Node.js](https://nodejs.org/)).
* **npm**: Gerenciador de pacotes padrão.
* **Celular ou Emulador:**
  * Celular físico com o app **Expo Go** instalado (disponível na [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) e [App Store](https://apps.google.com/app/expo-go/id982107779)).
  * Ou emulador **Android Studio** configurado no PC.

---

## 🚀 Como Executar o Projeto

### 1. Configuração e Inicialização do Backend

1. Abra um terminal e navegue até a pasta `backend`:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Verifique o arquivo `.env` com a conexão do banco Neon:
   ```env
   NODE_ENV="development"
   PORT=3333
   HOST="0.0.0.0"
   DATABASE_URL="postgresql://usuario:senha@ep-exemplo.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="sua_chave_secreta_jwt_minimo_10_caracteres"
   TZ="America/Sao_Paulo"
   ```

4. Execute as migrações do Prisma (se necessário) e inicie o servidor:
   ```bash
   npm run dev
   ```
   * 🚀 Servidor HTTP rodando em: `http://localhost:3333`
   * 📚 Documentação Swagger disponível em: `http://localhost:3333/docs`

---

### 2. Configuração e Inicialização do Mobile

1. Abra um **segundo terminal** e navegue até a pasta `mobile`:
   ```bash
   cd mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o Metro Bundler do Expo:
   ```bash
   npx expo start -c --tunnel
   ```

4. **Para testar no seu celular físico:**
   * Abra o aplicativo **Expo Go** no celular.
   * Toque em **"Scan QR code"** e aponte para o QR Code gerado no terminal.

5. **Para testar no Emulador Android Studio:**
   * Pressione a tecla **`a`** no terminal.

---

## 📚 Documentação da API (Swagger)

A API possui documentação interativa completa gerada via Swagger OpenAPI. Com o backend rodando, acesse no navegador:

👉 **[http://localhost:3333/docs](http://localhost:3333/docs)**

Pelo Swagger é possível:
* Autenticar-se (`/api/auth/login`) e autorizar as requisições com o Bearer Token.
* Testar os endpoints de produtos, lotes, consultas de semáforo e disparo manual de alertas.

---

## 🧪 Testes Automatizados

O backend possui uma suíte com **29 testes automatizados** cobrindo regras de negócio, semáforo de validades, cálculo de marcos e fluxo E2E completo:

```bash
cd backend
npm test
```

Resultado:
```text
Test Files  5 passed (5)
     Tests  29 passed (29)
```

