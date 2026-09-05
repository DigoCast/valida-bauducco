import { describe, expect, it } from "vitest";
import { calcularCriticidadeValidade } from "@/utils/traffic-light.js";
import { dayjs } from "@/lib/dayjs.js";

describe("Semáforo de Criticidade de Vencimento com 5 Marcos (Traffic Light)", () => {
  const dataReferencia = dayjs.tz("2026-08-26", "YYYY-MM-DD", "America/Sao_Paulo").toDate();

  it("deve classificar como VENCIDO / CRITICO quando o produto já estiver vencido", () => {
    const dataValidade = dayjs(dataReferencia).subtract(2, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("VENCIDO");
    expect(resultado.urgencia).toBe("CRITICO");
    expect(resultado.corSemaforo).toBe("vermelho");
    expect(resultado.estaVencido).toBe(true);
    expect(resultado.diasRestantes).toBe(-2);
  });

  it("deve classificar como 3_DIAS / CRITICO quando o produto vence hoje (0 dias)", () => {
    const dataValidade = dataReferencia;
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("3_DIAS");
    expect(resultado.urgencia).toBe("CRITICO");
    expect(resultado.corSemaforo).toBe("vermelho");
    expect(resultado.estaVencido).toBe(false);
    expect(resultado.diasRestantes).toBe(0);
  });

  it("deve classificar como 3_DIAS / CRITICO no limite de 3 dias restantes", () => {
    const dataValidade = dayjs(dataReferencia).add(3, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("3_DIAS");
    expect(resultado.urgencia).toBe("CRITICO");
    expect(resultado.corSemaforo).toBe("vermelho");
    expect(resultado.diasRestantes).toBe(3);
  });

  it("deve classificar como 10_DIAS / ALERTA_10D quando vencer entre 4 e 10 dias (ex: 10 dias)", () => {
    const dataValidade = dayjs(dataReferencia).add(10, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("10_DIAS");
    expect(resultado.urgencia).toBe("ALERTA_10D");
    expect(resultado.corSemaforo).toBe("laranja");
    expect(resultado.diasRestantes).toBe(10);
  });

  it("deve classificar como 20_DIAS / ALERTA_20D quando vencer entre 11 e 20 dias (ex: 20 dias)", () => {
    const dataValidade = dayjs(dataReferencia).add(20, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("20_DIAS");
    expect(resultado.urgencia).toBe("ALERTA_20D");
    expect(resultado.corSemaforo).toBe("amarelo");
    expect(resultado.diasRestantes).toBe(20);
  });

  it("deve classificar como 1_MES / ALERTA_1M quando vencer entre 21 e 30 dias (ex: 30 dias)", () => {
    const dataValidade = dayjs(dataReferencia).add(30, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("1_MES");
    expect(resultado.urgencia).toBe("ALERTA_1M");
    expect(resultado.corSemaforo).toBe("azul");
    expect(resultado.diasRestantes).toBe(30);
  });

  it("deve classificar como 2_MESES / ALERTA_2M quando vencer entre 31 e 60 dias (ex: 60 dias)", () => {
    const dataValidade = dayjs(dataReferencia).add(60, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("2_MESES");
    expect(resultado.urgencia).toBe("ALERTA_2M");
    expect(resultado.corSemaforo).toBe("roxo");
    expect(resultado.diasRestantes).toBe(60);
  });

  it("deve classificar como NORMAL quando a validade for superior a 60 dias (ex: 61 dias)", () => {
    const dataValidade = dayjs(dataReferencia).add(61, "day").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.marco).toBe("NORMAL");
    expect(resultado.urgencia).toBe("NORMAL");
    expect(resultado.corSemaforo).toBe("verde");
    expect(resultado.diasRestantes).toBe(61);
    expect(resultado.estaVencido).toBe(false);
  });

  it("deve formatar a data corretamente no padrão DD/MM/YYYY", () => {
    const dataValidade = dayjs.tz("2026-12-25", "YYYY-MM-DD", "America/Sao_Paulo").toDate();
    const resultado = calcularCriticidadeValidade(dataValidade, dataReferencia);

    expect(resultado.dataFormatada).toBe("25/12/2026");
  });

  it("deve formatar a data corretamente mesmo quando fornecida como Date UTC pura (ex: do Prisma)", () => {
    const prismaDate = new Date("2026-10-17T00:00:00.000Z");
    const resultado = calcularCriticidadeValidade(prismaDate, dataReferencia);

    expect(resultado.dataFormatada).toBe("17/10/2026");
  });
});
