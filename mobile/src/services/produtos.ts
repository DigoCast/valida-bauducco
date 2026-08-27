import { api } from "./api";
import { Produto } from "@/types/index";

export interface UpsertProdutoDTO {
  codigoBarras: string;
  nome: string;
  categoria?: string | null;
}

export async function getProdutoByBarcode(barcode: string): Promise<Produto> {
  const response = await api.get<{ produto: Produto }>(`/api/produtos/barcode/${barcode}`);
  return response.data.produto;
}

export async function getProdutoById(id: string): Promise<Produto> {
  const response = await api.get<{ produto: Produto }>(`/api/produtos/${id}`);
  return response.data.produto;
}

export async function listProdutos(search?: string): Promise<Produto[]> {
  const response = await api.get<{ produtos: Produto[] }>("/api/produtos", {
    params: search ? { search } : undefined,
  });
  return response.data.produtos;
}

export async function upsertProduto(data: UpsertProdutoDTO): Promise<Produto> {
  const response = await api.post<{ message: string; produto: Produto }>("/api/produtos", data);
  return response.data.produto;
}
