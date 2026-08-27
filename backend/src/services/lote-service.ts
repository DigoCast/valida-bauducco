import { LoteRepository, UpdateLoteDTO } from "@/repositories/lote-repository.js";
import { ProdutoRepository } from "@/repositories/produto-repository.js";
import { NotFoundError } from "@/errors/app-error.js";
import { calcularCriticidadeValidade } from "@/utils/traffic-light.js";
import { dayjs } from "@/lib/dayjs.js";
import { StatusLote } from "@prisma/client";

export interface CreateLoteInput {
  produtoId: string;
  numeroLote?: string | null;
  dataValidade: string; // formato YYYY-MM-DD
  quantidade: number;
}

export interface UpdateLoteInput {
  numeroLote?: string | null;
  dataValidade?: string; // formato YYYY-MM-DD
  quantidade?: number;
  status?: StatusLote;
}

export class LoteService {
  constructor(
    private loteRepository = new LoteRepository(),
    private produtoRepository = new ProdutoRepository()
  ) {}

  async create(data: CreateLoteInput) {
    const produto = await this.produtoRepository.findById(data.produtoId);

    if (!produto) {
      throw new NotFoundError("Produto informado não foi encontrado para vincular o lote.");
    }

    const dataValidadeObj = dayjs.tz(data.dataValidade, "YYYY-MM-DD", "America/Sao_Paulo").toDate();

    const lote = await this.loteRepository.create({
      produtoId: data.produtoId,
      numeroLote: data.numeroLote,
      dataValidade: dataValidadeObj,
      quantidade: data.quantidade,
      status: "ativo",
    });

    const criticidade = calcularCriticidadeValidade(lote.dataValidade);

    return {
      ...lote,
      ...criticidade,
    };
  }

  async getDashboard() {
    const lotesAtivos = await this.loteRepository.findAllActive();

    let totalCriticos3Dias = 0;
    let totalAlerta10Dias = 0;
    let totalAlerta20Dias = 0;
    let totalAlerta1Mes = 0;
    let totalAlerta2Meses = 0;
    let totalNormal = 0;
    let totalQuantidadeItens = 0;

    const lotesFormatados = lotesAtivos.map((lote) => {
      const criticidade = calcularCriticidadeValidade(lote.dataValidade);

      switch (criticidade.marco) {
        case "VENCIDO":
        case "3_DIAS":
          totalCriticos3Dias += 1;
          break;
        case "10_DIAS":
          totalAlerta10Dias += 1;
          break;
        case "20_DIAS":
          totalAlerta20Dias += 1;
          break;
        case "1_MES":
          totalAlerta1Mes += 1;
          break;
        case "2_MESES":
          totalAlerta2Meses += 1;
          break;
        case "NORMAL":
        default:
          totalNormal += 1;
          break;
      }

      totalQuantidadeItens += lote.quantidade;

      return {
        ...lote,
        ...criticidade,
      };
    });

    return {
      metricas: {
        totalCriticos3Dias,
        totalAlerta10Dias,
        totalAlerta20Dias,
        totalAlerta1Mes,
        totalAlerta2Meses,
        totalNormal,
        totalLotesAtivos: lotesAtivos.length,
        totalQuantidadeItens,
        // Agrupadores simplificados para telas de resumo
        totalCriticos: totalCriticos3Dias,
        totalAlertas:
          totalAlerta10Dias + totalAlerta20Dias + totalAlerta1Mes + totalAlerta2Meses,
      },
      lotes: lotesFormatados,
    };
  }

  async getById(id: string) {
    const lote = await this.loteRepository.findById(id);

    if (!lote) {
      throw new NotFoundError("Lote não encontrado.");
    }

    const criticidade = calcularCriticidadeValidade(lote.dataValidade);

    return {
      ...lote,
      ...criticidade,
    };
  }

  async update(id: string, data: UpdateLoteInput) {
    const existing = await this.loteRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Lote não encontrado para atualização.");
    }

    const updateData: UpdateLoteDTO = {
      numeroLote: data.numeroLote,
      quantidade: data.quantidade,
      status: data.status,
    };

    if (data.dataValidade) {
      updateData.dataValidade = dayjs
        .tz(data.dataValidade, "YYYY-MM-DD", "America/Sao_Paulo")
        .toDate();
    }

    const updated = await this.loteRepository.update(id, updateData);
    const criticidade = calcularCriticidadeValidade(updated.dataValidade);

    return {
      ...updated,
      ...criticidade,
    };
  }

  async darBaixa(id: string, status: "vendido" | "descartado") {
    const existing = await this.loteRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Lote não encontrado para dar baixa.");
    }

    const updated = await this.loteRepository.updateStatus(id, status);

    return {
      message: `Baixa realizada com sucesso no lote. Status atualizado para '${status}'.`,
      lote: updated,
    };
  }

  async delete(id: string) {
    const existing = await this.loteRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Lote não encontrado para exclusão.");
    }

    await this.loteRepository.delete(id);

    return {
      message: "Lote excluído permanentemente com sucesso.",
    };
  }
}
