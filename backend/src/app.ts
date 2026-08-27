import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/error-handler.js";
import { appRoutes } from "./routes/index.js";

export const app = fastify({
  logger: env.NODE_ENV === "development",
  ajv: {
    customOptions: {
      strict: false,
    },
  },
});

// 1. CORS
app.register(cors, {
  origin: true,
  credentials: true,
});

// 2. JWT Plugin
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

// 3. Documentação Swagger / OpenAPI
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "ValidaBauducco API",
      description:
        "API Backend para gestão de validade, múltiplos lotes e alertas preventivos da Casa Bauducco.",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Servidor Local de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT gerado na rota /api/auth/login",
        },
      },
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

// 4. Rotas de Health Check
app.get("/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "ValidaBauducco API",
  };
});

app.get("/", async (request, reply) => {
  return reply.redirect("/docs");
});

// 5. Rotas da Aplicação
app.register(appRoutes);

// 6. Handler Global Centralizado de Erros
app.setErrorHandler(errorHandler);
