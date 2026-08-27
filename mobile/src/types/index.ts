export type Role = "OPERATOR" | "ADMIN";

export type StatusLote = "ativo" | "vendido" | "descartado";

export type MarcoValidade =
  | "VENCIDO"
  | "3_DIAS"
  | "10_DIAS"
  | "20_DIAS"
  | "1_MES"
  | "2_MESES"
  | "NORMAL";

export type NivelUrgencia =
  | "CRITICO"
  | "ALERTA_10D"
  | "ALERTA_20D"
  | "ALERTA_1M"
  | "ALERTA_2M"
  | "NORMAL";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  lojaId?: string | null;
  criadoEm: string;
}

export interface Produto {
  id: string;
  codigoBarras: string;
  nome: string;
  categoria?: string | null;
  lojaId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  lotes: Lote[];
}

export interface Lote {
  id: string;
  produtoId: string;
  numeroLote?: string | null;
  dataValidade: string;
  quantidade: number;
  status: StatusLote;
  criadoEm: string;
  atualizadoEm: string;
  // Campos computados pelo backend
  diasRestantes: number;
  marco: MarcoValidade;
  urgencia: NivelUrgencia;
  descricaoStatus: string;
  corSemaforo: "vermelho" | "laranja" | "amarelo" | "azul" | "roxo" | "verde";
  estaVencido: boolean;
  dataFormatada: string;
  produto?: {
    id: string;
    nome: string;
    codigoBarras: string;
    categoria?: string | null;
  };
}

export interface DashboardMetricas {
  totalCriticos3Dias: number;
  totalAlerta10Dias: number;
  totalAlerta20Dias: number;
  totalAlerta1Mes: number;
  totalAlerta2Meses: number;
  totalNormal: number;
  totalLotesAtivos: number;
  totalQuantidadeItens: number;
  totalCriticos: number;
  totalAlertas: number;
}

export interface DashboardResponse {
  metricas: DashboardMetricas;
  lotes: Lote[];
}
