import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth-routes.js";
import { produtoRoutes } from "./produto-routes.js";
import { loteRoutes } from "./lote-routes.js";
import { dispositivoRoutes } from "./dispositivo-routes.js";
import { jobRoutes } from "./job-routes.js";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(produtoRoutes, { prefix: "/api/produtos" });
  app.register(loteRoutes, { prefix: "/api/lotes" });
  app.register(dispositivoRoutes, { prefix: "/api/dispositivos" });
  app.register(jobRoutes, { prefix: "/api/jobs" });
}
