import { FastifyInstance } from "fastify";
import { LoteController } from "@/controllers/lote-controller.js";
import { verifyJwt } from "@/middlewares/auth-middleware.js";

export async function loteRoutes(app: FastifyInstance) {
  const controller = new LoteController();

  app.addHook("onRequest", verifyJwt);

  app.post(
    "/",
    {
      schema: {
        tags: ["Lotes"],
        summary: "Cadastrar um novo lote vinculado a um produto",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["produtoId", "dataValidade", "quantidade"],
          properties: {
            produtoId: { type: "string", format: "uuid" },
            numeroLote: { type: "string", nullable: true, example: "L2024A" },
            dataValidade: { type: "string", example: "2026-09-15", description: "Formato YYYY-MM-DD" },
            quantidade: { type: "integer", minimum: 1, default: 1, example: 10 },
          },
        },
      },
    },
    controller.create
  );

  app.get(
    "/dashboard",
    {
      schema: {
        tags: ["Lotes"],
        summary: "Obter dashboard com resumo agregado e lista de lotes com semáforo de criticidade",
        security: [{ bearerAuth: [] }],
      },
    },
    controller.dashboard
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["Lotes"],
        summary: "Buscar detalhes de um lote por ID",
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
        tags: ["Lotes"],
        summary: "Atualizar dados de um lote existente",
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
            numeroLote: { type: "string", nullable: true },
            dataValidade: { type: "string", example: "2026-09-20" },
            quantidade: { type: "integer", minimum: 1 },
            status: { type: "string", enum: ["ativo", "vendido", "descartado"] },
          },
        },
      },
    },
    controller.update
  );

  app.patch(
    "/:id/baixa",
    {
      schema: {
        tags: ["Lotes"],
        summary: "Dar baixa em um lote (marcar como vendido ou descartado)",
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
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["vendido", "descartado"] },
          },
        },
      },
    },
    controller.darBaixa
  );

  app.delete(
    "/:id",
    {
      schema: {
        tags: ["Lotes"],
        summary: "Excluir permanentemente um lote",
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
