import { FastifyInstance } from "fastify";
import { AuthController } from "@/controllers/auth-controller.js";
import { verifyJwt } from "@/middlewares/auth-middleware.js";

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.post(
    "/register",
    {
      schema: {
        tags: ["Autenticação"],
        summary: "Cadastrar um novo usuário",
        body: {
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: { type: "string", example: "Gerente Bauducco" },
            email: { type: "string", format: "email", example: "loja@bauducco.com.br" },
            senha: { type: "string", minLength: 6, example: "123456" },
            role: { type: "string", enum: ["OPERATOR", "ADMIN"], default: "OPERATOR" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  nome: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                  lojaId: { type: "string", nullable: true },
                  criadoEm: { type: "string" },
                },
              },
              token: { type: "string" },
            },
          },
        },
      },
    },
    controller.register
  );

  app.post(
    "/login",
    {
      schema: {
        tags: ["Autenticação"],
        summary: "Autenticar usuário e obter token JWT",
        body: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", format: "email", example: "loja@bauducco.com.br" },
            senha: { type: "string", example: "123456" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  nome: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                  lojaId: { type: "string", nullable: true },
                },
              },
              token: { type: "string" },
            },
          },
        },
      },
    },
    controller.login
  );

  app.get(
    "/me",
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ["Autenticação"],
        summary: "Obter dados do usuário autenticado atual",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  nome: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                  lojaId: { type: "string", nullable: true },
                  criadoEm: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    controller.me
  );
}
