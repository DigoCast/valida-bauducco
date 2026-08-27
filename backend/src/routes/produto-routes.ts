import { FastifyInstance } from "fastify";
import { ProdutoController } from "@/controllers/produto-controller.js";
import { verifyJwt } from "@/middlewares/auth-middleware.js";

export async function produtoRoutes(app: FastifyInstance) {
  const controller = new ProdutoController();

  // Aplica verificação JWT em todas as rotas de produtos
  app.addHook("onRequest", verifyJwt);

  app.post(
    "/",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Cadastrar ou atualizar (upsert) um produto pelo código de barras",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["codigoBarras", "nome"],
          properties: {
            codigoBarras: { type: "string", example: "7891234567890" },
            nome: { type: "string", example: "Panettone Tradicional 500g" },
            categoria: { type: "string", example: "Panettones" },
          },
        },
      },
    },
    controller.upsert
  );

  app.get(
    "/",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Listar todos os produtos cadastrados com seus lotes ativos",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            search: { type: "string", description: "Busca por nome, categoria ou código de barras" },
          },
        },
      },
    },
    controller.list
  );

  app.get(
    "/barcode/:ean",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Buscar produto e seus lotes ativos pelo código de barras (EAN)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["ean"],
          properties: {
            ean: { type: "string", example: "7891234567890" },
          },
        },
      },
    },
    controller.getByBarcode
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Buscar produto por ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    controller.getById
  );

  app.put(
    "/:id",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Atualizar informações do produto",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            nome: { type: "string" },
            categoria: { type: "string" },
            codigoBarras: { type: "string" },
          },
        },
      },
    },
    controller.update
  );

  app.delete(
    "/:id",
    {
      schema: {
        tags: ["Produtos"],
        summary: "Excluir permanentemente um produto e seus lotes",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
      },
    },
    controller.delete
  );
}
