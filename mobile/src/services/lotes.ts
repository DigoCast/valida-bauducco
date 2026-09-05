import { api } from "./api";
import { DashboardResponse, Lote } from "@/types/index";

export interface CreateLoteDTO {
  produtoId: string;
  numeroLote?: string | null;
  dataValidade: string; // YYYY-MM-DD
  quantidade: number;
}

export interface UpdateLoteDTO {
  numeroLote?: string | null;
  dataValidade?: string; // YYYY-MM-DD
  quantidade?: number;
  status?: "ativo" | "vendido" | "descartado";
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/api/lotes/dashboard");
  return response.data;
}

export async function createLote(data: CreateLoteDTO): Promise<Lote> {
  const response = await api.post<{ message: string; lote: Lote }>("/api/lotes", data);
  return response.data.lote;
}

export async function updateLote(id: string, data: UpdateLoteDTO): Promise<Lote> {
  const response = await api.put<{ message: string; lote: Lote }>(`/api/lotes/${id}`, data);
  return response.data.lote;
}

export async function darBaixaLote(id: string, status: "vendido" | "descartado"): Promise<Lote> {
  const response = await api.patch<{ message: string; lote: Lote }>(`/api/lotes/${id}/baixa`, {
    status,
  });
  return response.data.lote;
}

export async function deleteLote(id: string): Promise<void> {
  await api.delete(`/api/lotes/${id}`);
}

export async function triggerAlertaValidadeManual(): Promise<any> {
  const response = await api.post("/api/jobs/trigger-alerta-validade");
  return response.data;
}
