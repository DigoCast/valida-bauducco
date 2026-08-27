import cron from "node-cron";
import { AlertaValidadeService } from "@/services/alerta-validade-service.js";
import { DEFAULT_TIMEZONE } from "@/lib/dayjs.js";

export function setupAlertaValidadeCron() {
  const alertaService = new AlertaValidadeService();

  // Executa diariamente às 08:00 da manhã no fuso America/Sao_Paulo
  const cronJob = cron.schedule(
    "0 8 * * *",
    async () => {
      console.log(`⏰ [CRON] Iniciando rotina diária de verificação de validades às 08:00...`);
      try {
        const resultado = await alertaService.executarVarreduraEAlerta();
        console.log(
          `✅ [CRON] Rotina finalizada: ${resultado.totalLotesCriticos} lotes críticos encontrados. Dispositivos notificados: ${resultado.totalDispositivosNotificados}.`
        );
      } catch (error) {
        console.error("❌ [CRON] Erro ao executar rotina de alerta de validade:", error);
      }
    },
    {
      timezone: DEFAULT_TIMEZONE,
    }
  );

  console.log(`📅 [CRON] Agendador de alertas diários inicializado para as 08:00 (${DEFAULT_TIMEZONE}).`);

  return cronJob;
}
