import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoteService } from "@/services/lote-service.js";
import { LoteRepository } from "@/repositories/lote-repository.js";
import { ProdutoRepository } from "@/repositories/produto-repository.js";
import { dayjs } from "@/lib/dayjs.js";

describe("LoteService com 5 Marcos de Validade", () => {
  let loteRepository: LoteRepository;
  let produtoRepository: ProdutoRepository;
  let loteService: LoteService;

  beforeEach(() => {
    loteRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAllActive: vi.fn(),
      findCriticalActive: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
    } as unknown as LoteRepository;

    produtoRepository = {
      findById: vi.fn(),
    } as unknown as ProdutoRepository;

    loteService = new LoteService(loteRepository, produtoRepository);
  });

  it("deve criar um lote vinculado ao produto com semáforo computado", async () => {
    vi.spyOn(produtoRepository, "findById").mockResolvedValue({
      id: "prod-1",
      codigoBarras: "7891234567890",
      nome: "Chocottone 500g",
      categoria: "Panettones",
      lojaId: null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const dataValidadeStr = dayjs().add(20, "day").format("YYYY-MM-DD");
    const dataValidadeDate = dayjs(dataValidadeStr).toDate();

    vi.spyOn(loteRepository, "create").mockResolvedValue({
      id: "lote-1",
      produtoId: "prod-1",
      numeroLote: "L-CHOCO-2026",
      dataValidade: dataValidadeDate,
      quantidade: 15,
      status: "ativo",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const result = await loteService.create({
      produtoId: "prod-1",
      numeroLote: "L-CHOCO-2026",
      dataValidade: dataValidadeStr,
      quantidade: 15,
    });

    expect(result.id).toBe("lote-1");
    expect(result.marco).toBe("20_DIAS");
    expect(result.urgencia).toBe("ALERTA_20D");
    expect(result.quantidade).toBe(15);
  });

  it("deve calcular métricas consolidadas por marco no dashboard", async () => {
    const data3Dias = dayjs().add(2, "day").toDate(); // <= 3 dias (3_DIAS)
    const data10Dias = dayjs().add(8, "day").toDate(); // 4 a 10 dias (10_DIAS)
    const data20Dias = dayjs().add(18, "day").toDate(); // 11 a 20 dias (20_DIAS)
    const data1Mes = dayjs().add(28, "day").toDate(); // 21 a 30 dias (1_MES)
    const data2Meses = dayjs().add(50, "day").toDate(); // 31 a 60 dias (2_MESES)
    const dataNormal = dayjs().add(90, "day").toDate(); // > 60 dias (NORMAL)

    const lotesMock = [
      {
        id: "lote-1",
        produtoId: "prod-1",
        numeroLote: "L1",
        dataValidade: data3Dias,
        quantidade: 10,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 1", codigoBarras: "111" },
      },
      {
        id: "lote-2",
        produtoId: "prod-2",
        numeroLote: "L2",
        dataValidade: data10Dias,
        quantidade: 5,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 2", codigoBarras: "222" },
      },
      {
        id: "lote-3",
        produtoId: "prod-3",
        numeroLote: "L3",
        dataValidade: data20Dias,
        quantidade: 12,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 3", codigoBarras: "333" },
      },
      {
        id: "lote-4",
        produtoId: "prod-4",
        numeroLote: "L4",
        dataValidade: data1Mes,
        quantidade: 8,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 4", codigoBarras: "444" },
      },
      {
        id: "lote-5",
        produtoId: "prod-5",
        numeroLote: "L5",
        dataValidade: data2Meses,
        quantidade: 15,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 5", codigoBarras: "555" },
      },
      {
        id: "lote-6",
        produtoId: "prod-6",
        numeroLote: "L6",
        dataValidade: dataNormal,
        quantidade: 20,
        status: "ativo" as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        produto: { nome: "Item 6", codigoBarras: "666" },
      },
    ];

    vi.spyOn(loteRepository, "findAllActive").mockResolvedValue(lotesMock as any);

    const dashboard = await loteService.getDashboard();

    expect(dashboard.metricas.totalCriticos3Dias).toBe(1);
    expect(dashboard.metricas.totalAlerta10Dias).toBe(1);
    expect(dashboard.metricas.totalAlerta20Dias).toBe(1);
    expect(dashboard.metricas.totalAlerta1Mes).toBe(1);
    expect(dashboard.metricas.totalAlerta2Meses).toBe(1);
    expect(dashboard.metricas.totalNormal).toBe(1);
    expect(dashboard.metricas.totalLotesAtivos).toBe(6);
    expect(dashboard.metricas.totalQuantidadeItens).toBe(70);
  });

  it("deve dar baixa no lote com status vendido ou descartado", async () => {
    vi.spyOn(loteRepository, "findById").mockResolvedValue({
      id: "lote-1",
      produtoId: "prod-1",
      numeroLote: "L1",
      dataValidade: new Date(),
      quantidade: 10,
      status: "ativo",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      produto: {} as any,
    });

    vi.spyOn(loteRepository, "updateStatus").mockResolvedValue({
      id: "lote-1",
      produtoId: "prod-1",
      numeroLote: "L1",
      dataValidade: new Date(),
      quantidade: 10,
      status: "vendido",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      produto: {} as any,
    });

    const result = await loteService.darBaixa("lote-1", "vendido");

    expect(result.lote.status).toBe("vendido");
  });

  it("deve atualizar os dados de um lote e recalcular a criticidade", async () => {
    const dataCriacao = new Date();
    const existingLote = {
      id: "lote-1",
      produtoId: "prod-1",
      numeroLote: "L-OLD",
      dataValidade: dayjs().add(5, "day").toDate(),
      quantidade: 10,
      status: "ativo" as const,
      criadoEm: dataCriacao,
      atualizadoEm: dataCriacao,
      produto: {} as any,
    };

    vi.spyOn(loteRepository, "findById").mockResolvedValue(existingLote);

    const novaDataValidadeStr = dayjs().add(25, "day").format("YYYY-MM-DD");
    const novaDataValidadeDate = dayjs(novaDataValidadeStr).toDate();

    vi.spyOn(loteRepository, "update").mockResolvedValue({
      ...existingLote,
      numeroLote: "L-NEW-2026",
      quantidade: 25,
      dataValidade: novaDataValidadeDate,
      status: "ativo",
    });

    const result = await loteService.update("lote-1", {
      numeroLote: "L-NEW-2026",
      quantidade: 25,
      dataValidade: novaDataValidadeStr,
      status: "ativo",
    });

    expect(result.id).toBe("lote-1");
    expect(result.numeroLote).toBe("L-NEW-2026");
    expect(result.quantidade).toBe(25);
    expect(result.marco).toBe("1_MES");
    expect(result.urgencia).toBe("ALERTA_1M");
  });

  it("deve lançar NotFoundError ao tentar atualizar lote inexistente", async () => {
    vi.spyOn(loteRepository, "findById").mockResolvedValue(null);

    await expect(
      loteService.update("lote-inexistente", {
        quantidade: 5,
      })
    ).rejects.toThrow("Lote não encontrado para atualização.");
  });
});
