import { ProdutoRepository, UpdateProdutoDTO, UpsertProdutoDTO } from "@/repositories/produto-repository.js";
import { NotFoundError } from "@/errors/app-error.js";
import { calcularCriticidadeValidade } from "@/utils/traffic-light.js";

export class ProdutoService {
  constructor(private produtoRepository = new ProdutoRepository()) {}

  async upsert(data: UpsertProdutoDTO) {
    return this.produtoRepository.upsert(data);
  }

  async getByBarcode(barcode: string) {
    const produto = await this.produtoRepository.findByCodigoBarras(barcode);

    if (!produto) {
      throw new NotFoundError(`Produto com código de barras '${barcode}' não encontrado.`);
    }

    const lotesFormatados = produto.lotes.map((lote) => {
      const criticidade = calcularCriticidadeValidade(lote.dataValidade);
      return {
        ...lote,
        ...criticidade,
      };
    });

    return {
      ...produto,
      lotes: lotesFormatados,
    };
  }

  async getById(id: string, apenasLotesAtivos = true) {
    const produto = await this.produtoRepository.findById(id, apenasLotesAtivos);

    if (!produto) {
      throw new NotFoundError("Produto não encontrado.");
    }

    const lotesFormatados = produto.lotes.map((lote) => {
      const criticidade = calcularCriticidadeValidade(lote.dataValidade);
      return {
        ...lote,
        ...criticidade,
      };
    });

    return {
      ...produto,
      lotes: lotesFormatados,
    };
  }

  async list(search?: string) {
    const produtos = await this.produtoRepository.findAll(search);

    return produtos.map((produto) => ({
      ...produto,
      lotes: produto.lotes.map((lote) => ({
        ...lote,
        ...calcularCriticidadeValidade(lote.dataValidade),
      })),
    }));
  }

  async update(id: string, data: UpdateProdutoDTO) {
    const existing = await this.produtoRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Produto não encontrado para atualização.");
    }

    return this.produtoRepository.update(id, data);
  }

  async delete(id: string) {
    const existing = await this.produtoRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Produto não encontrado para exclusão.");
    }

    return this.produtoRepository.delete(id);
  }
}
