import { dayjs } from "@/lib/dayjs.js";

export type MarcoValidade =
  | "VENCIDO"
  | "3_DIAS"
  | "10_DIAS"
  | "20_DIAS"
  | "1_MES"
  | "2_MESES"
  | "NORMAL";

export type NivelUrgencia =
  | "CRITICO"
  | "ALERTA_10D"
  | "ALERTA_20D"
  | "ALERTA_1M"
  | "ALERTA_2M"
  | "NORMAL";

export interface InfoCriticidade {
  diasRestantes: number;
  marco: MarcoValidade;
  urgencia: NivelUrgencia;
  descricaoStatus: string;
  corSemaforo: "vermelho" | "laranja" | "amarelo" | "azul" | "roxo" | "verde";
  estaVencido: boolean;
  dataFormatada: string;
}

/**
 * Calcula a quantidade de dias restantes e classifica o lote nos 5 marcos de alerta:
 * - Vencido: diasRestantes < 0
 * - 3 Dias: diasRestantes entre 0 e 3 (Emergência / Crítico)
 * - 10 Dias: diasRestantes entre 4 e 10 (Alerta Imediato)
 * - 20 Dias: diasRestantes entre 11 e 20 (Atenção Operacional)
 * - 1 Mês (30 dias): diasRestantes entre 21 e 30 (Alerta Preventivo)
 * - 2 Meses (60 dias): diasRestantes entre 31 e 60 (Planejamento de Vendas)
 * - Normal: diasRestantes > 60 (Estoque Seguro)
 */
export function calcularCriticidadeValidade(
  dataValidade: Date | string,
  dataReferencia: Date | string = new Date()
): InfoCriticidade {
  const hoje = dayjs(dataReferencia).tz().startOf("day");
  const validade = dayjs(dataValidade).tz().startOf("day");

  const diasRestantes = validade.diff(hoje, "day");
  const estaVencido = diasRestantes < 0;

  let marco: MarcoValidade = "NORMAL";
  let urgencia: NivelUrgencia = "NORMAL";
  let descricaoStatus = "Validade segura (+2 meses)";
  let corSemaforo: InfoCriticidade["corSemaforo"] = "verde";

  if (diasRestantes < 0) {
    marco = "VENCIDO";
    urgencia = "CRITICO";
    descricaoStatus = `Vencido há ${Math.abs(diasRestantes)} dia(s)`;
    corSemaforo = "vermelho";
  } else if (diasRestantes <= 3) {
    marco = "3_DIAS";
    urgencia = "CRITICO";
    descricaoStatus =
      diasRestantes === 0 ? "Vence hoje!" : `Vence em ${diasRestantes} dia(s) (Crítico)`;
    corSemaforo = "vermelho";
  } else if (diasRestantes <= 10) {
    marco = "10_DIAS";
    urgencia = "ALERTA_10D";
    descricaoStatus = `Vence em ${diasRestantes} dias (Alerta 10d)`;
    corSemaforo = "laranja";
  } else if (diasRestantes <= 20) {
    marco = "20_DIAS";
    urgencia = "ALERTA_20D";
    descricaoStatus = `Vence em ${diasRestantes} dias (Alerta 20d)`;
    corSemaforo = "amarelo";
  } else if (diasRestantes <= 30) {
    marco = "1_MES";
    urgencia = "ALERTA_1M";
    descricaoStatus = `Vence em ${diasRestantes} dias (Alerta 1 mês)`;
    corSemaforo = "azul";
  } else if (diasRestantes <= 60) {
    marco = "2_MESES";
    urgencia = "ALERTA_2M";
    descricaoStatus = `Vence em ${diasRestantes} dias (Alerta 2 meses)`;
    corSemaforo = "roxo";
  } else {
    marco = "NORMAL";
    urgencia = "NORMAL";
    descricaoStatus = `Vence em ${diasRestantes} dias (Seguro)`;
    corSemaforo = "verde";
  }

  return {
    diasRestantes,
    marco,
    urgencia,
    descricaoStatus,
    corSemaforo,
    estaVencido,
    dataFormatada: validade.format("DD/MM/YYYY"),
  };
}
