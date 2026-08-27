import { prisma } from "@/lib/prisma.js";
import { Produto } from "@prisma/client";

export interface UpsertProdutoDTO {
  codigoBarras: string;
  nome: string;
  categoria?: string | null;
  lojaId?: string | null;
}

export interface UpdateProdutoDTO {
  nome?: string;
  categoria?: string | null;
  codigoBarras?: string;
}

export class ProdutoRepository {
  async findByCodigoBarras(codigoBarras: string, apenasLotesAtivos = true) {
    return prisma.produto.findUnique({
      where: { codigoBarras },
      include: {
        lotes: {
          where: apenasLotesAtivos ? { status: "ativo" } : undefined,
          orderBy: { dataValidade: "asc" },
        },
      },
    });
  }

  async findById(id: string, apenasLotesAtivos = true) {
    return prisma.produto.findUnique({
      where: { id },
      include: {
        lotes: {
          where: apenasLotesAtivos ? { status: "ativo" } : undefined,
          orderBy: { dataValidade: "asc" },
        },
      },
    });
  }

  async findAll(search?: string) {
    return prisma.produto.findMany({
      where: search
        ? {
            OR: [
              { nome: { contains: search, mode: "insensitive" } },
              { codigoBarras: { contains: search } },
              { categoria: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        lotes: {
          where: { status: "ativo" },
          orderBy: { dataValidade: "asc" },
        },
      },
      orderBy: { nome: "asc" },
    });
  }

  async upsert(data: UpsertProdutoDTO): Promise<Produto> {
    return prisma.produto.upsert({
      where: { codigoBarras: data.codigoBarras },
      update: {
        nome: data.nome,
        categoria: data.categoria,
        lojaId: data.lojaId,
      },
      create: {
        codigoBarras: data.codigoBarras,
        nome: data.nome,
        categoria: data.categoria,
        lojaId: data.lojaId,
      },
    });
  }

  async update(id: string, data: UpdateProdutoDTO): Promise<Produto> {
    return prisma.produto.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Produto> {
    return prisma.produto.delete({
      where: { id },
    });
  }
}
