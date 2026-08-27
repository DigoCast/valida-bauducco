import { prisma } from "@/lib/prisma.js";
import { Lote, StatusLote } from "@prisma/client";

export interface CreateLoteDTO {
  produtoId: string;
  numeroLote?: string | null;
  dataValidade: Date;
  quantidade: number;
  status?: StatusLote;
}

export interface UpdateLoteDTO {
  numeroLote?: string | null;
  dataValidade?: Date;
  quantidade?: number;
  status?: StatusLote;
}

export class LoteRepository {
  async create(data: CreateLoteDTO): Promise<Lote> {
    return prisma.lote.create({
      data: {
        produtoId: data.produtoId,
        numeroLote: data.numeroLote,
        dataValidade: data.dataValidade,
        quantidade: data.quantidade,
        status: data.status || "ativo",
      },
      include: {
        produto: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.lote.findUnique({
      where: { id },
      include: {
        produto: true,
      },
    });
  }

  async findAllActive() {
    return prisma.lote.findMany({
      where: { status: "ativo" },
      include: {
        produto: true,
      },
      orderBy: { dataValidade: "asc" },
    });
  }

  async findCriticalActive(dataLimite: Date) {
    return prisma.lote.findMany({
      where: {
        status: "ativo",
        dataValidade: {
          lte: dataLimite,
        },
      },
      include: {
        produto: true,
      },
      orderBy: { dataValidade: "asc" },
    });
  }

  async update(id: string, data: UpdateLoteDTO): Promise<Lote> {
    return prisma.lote.update({
      where: { id },
      data,
      include: {
        produto: true,
      },
    });
  }

  async updateStatus(id: string, status: StatusLote): Promise<Lote> {
    return prisma.lote.update({
      where: { id },
      data: { status },
      include: {
        produto: true,
      },
    });
  }

  async delete(id: string): Promise<Lote> {
    return prisma.lote.delete({
      where: { id },
    });
  }
}
