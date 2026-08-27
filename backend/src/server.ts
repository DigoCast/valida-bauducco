import { app } from "./app.js";
import { env } from "./config/env.js";
import { setupAlertaValidadeCron } from "./jobs/cron-alerta-validade.js";

async function bootstrap() {
  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Servidor HTTP rodando em http://${env.HOST}:${env.PORT}`);
    console.log(`📚 Documentação Swagger disponível em http://localhost:${env.PORT}/docs`);

    // Inicia os agendamentos cron
    setupAlertaValidadeCron();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
