import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProdutoService } from "@/services/produto-service.js";
import { ProdutoRepository } from "@/repositories/produto-repository.js";
import { NotFoundError } from "@/errors/app-error.js";
import { dayjs } from "@/lib/dayjs.js";

describe("ProdutoService", () => {
  let produtoRepository: ProdutoRepository;
  let produtoService: ProdutoService;

  beforeEach(() => {
    produtoRepository = {
      upsert: vi.fn(),
      findByCodigoBarras: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as ProdutoRepository;

    produtoService = new ProdutoService(produtoRepository);
  });

  it("deve criar ou atualizar um produto pelo código de barras", async () => {
    const mockProduto = {
      id: "prod-1",
      codigoBarras: "7891234567890",
      nome: "Panettone Bauducco Frutas 500g",
      categoria: "Panettones",
      lojaId: null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    vi.spyOn(produtoRepository, "upsert").mockResolvedValue(mockProduto);

    const result = await produtoService.upsert({
      codigoBarras: "7891234567890",
      nome: "Panettone Bauducco Frutas 500g",
      categoria: "Panettones",
    });

    expect(result.id).toBe("prod-1");
    expect(result.nome).toBe("Panettone Bauducco Frutas 500g");
  });

  it("deve buscar produto por código de barras com os lotes calculando semáforo", async () => {
    const dataValidade = dayjs().add(2, "day").toDate();

    const mockProdutoComLotes = {
      id: "prod-1",
      codigoBarras: "7891234567890",
      nome: "Panettone Bauducco",
      categoria: "Panettones",
      lojaId: null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      lotes: [
        {
          id: "lote-1",
          produtoId: "prod-1",
          numeroLote: "L01",
          dataValidade,
          quantidade: 10,
          status: "ativo" as const,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ],
    };

    vi.spyOn(produtoRepository, "findByCodigoBarras").mockResolvedValue(mockProdutoComLotes as any);

    const result = await produtoService.getByBarcode("7891234567890");

    expect(result.id).toBe("prod-1");
    expect(result.lotes).toHaveLength(1);
    expect(result.lotes[0].marco).toBe("3_DIAS");
    expect(result.lotes[0].urgencia).toBe("CRITICO");
  });

  it("deve lançar NotFoundError se o código de barras não existir", async () => {
    vi.spyOn(produtoRepository, "findByCodigoBarras").mockResolvedValue(null);

    await expect(produtoService.getByBarcode("9999999999999")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
