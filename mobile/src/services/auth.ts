import { api } from "./api";
import { Usuario } from "@/types/index";

export interface LoginResponse {
  message: string;
  user: Usuario;
  token: string;
}

export interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
  role?: "OPERATOR" | "ADMIN";
}

export async function loginRequest(email: string, senha: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", { email, senha });
  return response.data;
}

export async function registerRequest(data: RegisterDTO): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/register", data);
  return response.data;
}

export async function getProfileRequest(): Promise<{ user: Usuario }> {
  const response = await api.get<{ user: Usuario }>("/api/auth/me");
  return response.data;
}
