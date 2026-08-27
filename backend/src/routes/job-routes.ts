import { FastifyInstance } from "fastify";
import { JobController } from "@/controllers/job-controller.js";
import { verifyJwt } from "@/middlewares/auth-middleware.js";

export async function jobRoutes(app: FastifyInstance) {
  const controller = new JobController();

  app.addHook("onRequest", verifyJwt);

  app.post(
    "/trigger-alerta-validade",
    {
      schema: {
        tags: ["Jobs & Notificações"],
        summary: "Executar manualmente a varredura de validades críticas e disparo de push notification",
        security: [{ bearerAuth: [] }],
      },
    },
    controller.triggerAlertaValidade
  );
}
