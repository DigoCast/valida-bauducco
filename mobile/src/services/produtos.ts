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

export interface UpdateProdutoDTO {
  nome?: string;
  categoria?: string | null;
  codigoBarras?: string;
}

export async function updateProduto(id: string, data: UpdateProdutoDTO): Promise<Produto> {
  const response = await api.put<{ message: string; produto: Produto }>(`/api/produtos/${id}`, data);
  return response.data.produto;
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/api/produtos/${id}`);
}

