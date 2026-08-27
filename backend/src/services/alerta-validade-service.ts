import { LoteRepository } from "@/repositories/lote-repository.js";
import { DispositivoRepository } from "@/repositories/dispositivo-repository.js";
import { dayjs } from "@/lib/dayjs.js";
import { sendExpoPushNotifications } from "@/lib/expo.js";
import { calcularCriticidadeValidade } from "@/utils/traffic-light.js";
import { ExpoPushMessage } from "expo-server-sdk";

export class AlertaValidadeService {
  constructor(
    private loteRepository = new LoteRepository(),
    private dispositivoRepository = new DispositivoRepository()
  ) {}

  async executarVarreduraEAlerta() {
    const hoje = dayjs().tz().startOf("day");
    // Varre até 60 dias (2 meses) para cobrir os marcos de 3d, 10d, 20d, 1 mês e 2 meses
    const limiteAlerta = hoje.add(60, "day").endOf("day").toDate();

    const lotesEmAlerta = await this.loteRepository.findCriticalActive(limiteAlerta);

    let countCriticos3Dias = 0;
    let countAlerta10Dias = 0;
    let countAlerta20Dias = 0;
    let countAlerta1Mes = 0;
    let countAlerta2Meses = 0;

    const lotesFormatados = lotesEmAlerta.map((lote) => {
      const criticidade = calcularCriticidadeValidade(lote.dataValidade);

      switch (criticidade.marco) {
        case "VENCIDO":
        case "3_DIAS":
          countCriticos3Dias += 1;
          break;
        case "10_DIAS":
          countAlerta10Dias += 1;
          break;
        case "20_DIAS":
          countAlerta20Dias += 1;
          break;
        case "1_MES":
          countAlerta1Mes += 1;
          break;
        case "2_MESES":
          countAlerta2Meses += 1;
          break;
      }

      return {
        id: lote.id,
        produtoNome: lote.produto.nome,
        codigoBarras: lote.produto.codigoBarras,
        numeroLote: lote.numeroLote,
        quantidade: lote.quantidade,
        dataValidade: lote.dataValidade,
        ...criticidade,
      };
    });

    const dispositivos = await this.dispositivoRepository.findAll();
    const tokens = dispositivos.map((d) => d.token);

    let ticketsEnviados: any[] = [];

    if (tokens.length > 0 && lotesFormatados.length > 0) {
      const totalItens = lotesFormatados.reduce((acc, curr) => acc + curr.quantidade, 0);

      // Constrói resumo visual dos marcos
      const partesMensagem: string[] = [];
      if (countCriticos3Dias > 0) partesMensagem.push(`🔴 ${countCriticos3Dias} crítico(s) (<=3d)`);
      if (countAlerta10Dias > 0) partesMensagem.push(`🟠 ${countAlerta10Dias} em até 10d`);
      if (countAlerta20Dias > 0) partesMensagem.push(`🟡 ${countAlerta20Dias} em até 20d`);
      if (countAlerta1Mes > 0) partesMensagem.push(`🔵 ${countAlerta1Mes} em até 1 mês`);
      if (countAlerta2Meses > 0) partesMensagem.push(`🟣 ${countAlerta2Meses} em até 2 meses`);

      const corpoMensagem =
        partesMensagem.length > 0
          ? `Resumo de Validades: ${partesMensagem.join(" | ")}. Total: ${totalItens} itens.`
          : `Atenção: Existem ${lotesFormatados.length} lote(s) nos prazos de monitoramento de validade.`;

      const titulo =
        countCriticos3Dias > 0
          ? "🚨 ValidaBauducco: Alerta Crítico de Vencimento!"
          : "🔔 ValidaBauducco: Atualização Diária de Validades";

      const mensagens: ExpoPushMessage[] = tokens.map((token) => ({
        to: token,
        sound: "default",
        title: titulo,
        body: corpoMensagem,
        data: {
          tipo: "ALERTA_VALIDADE",
          totalLotes: lotesFormatados.length,
          totalItens,
          marcos: {
            criticos3Dias: countCriticos3Dias,
            alerta10Dias: countAlerta10Dias,
            alerta20Dias: countAlerta20Dias,
            alerta1Mes: countAlerta1Mes,
            alerta2Meses: countAlerta2Meses,
          },
        },
        priority: countCriticos3Dias > 0 ? "high" : "default",
        channelId: "validade-alertas",
      }));

      ticketsEnviados = await sendExpoPushNotifications(mensagens);
    }

    return {
      executadoEm: dayjs().tz().format("YYYY-MM-DD HH:mm:ss"),
      totalLotesMonitorados: lotesFormatados.length,
      resumoMarcos: {
        criticos3Dias: countCriticos3Dias,
        alerta10Dias: countAlerta10Dias,
        alerta20Dias: countAlerta20Dias,
        alerta1Mes: countAlerta1Mes,
        alerta2Meses: countAlerta2Meses,
      },
      totalDispositivosNotificados: tokens.length,
      ticketsEnviados,
      lotes: lotesFormatados,
    };
  }
}
