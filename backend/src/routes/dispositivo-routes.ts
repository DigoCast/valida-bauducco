import { FastifyInstance } from "fastify";
import { DispositivoController } from "@/controllers/dispositivo-controller.js";
import { verifyJwt } from "@/middlewares/auth-middleware.js";

export async function dispositivoRoutes(app: FastifyInstance) {
  const controller = new DispositivoController();

  app.addHook("onRequest", verifyJwt);

  app.post(
    "/token",
    {
      schema: {
        tags: ["Dispositivos"],
        summary: "Registrar ou atualizar o Expo Push Token do dispositivo",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
            },
          },
        },
      },
    },
    controller.register
  );

  app.get(
    "/tokens",
    {
      schema: {
        tags: ["Dispositivos"],
        summary: "Listar todos os push tokens registrados",
        security: [{ bearerAuth: [] }],
      },
    },
    controller.list
  );

  app.delete(
    "/token/:token",
    {
      schema: {
        tags: ["Dispositivos"],
        summary: "Remover token de notificação de um dispositivo",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string" },
          },
        },
      },
    },
    controller.remove
  );
}
