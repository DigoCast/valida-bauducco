import axios from "axios";
import { Storage } from "@/utils/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Obtém dinamicamente o IP da máquina local no Expo Go ou usa fallback para emuladores
 */
function getBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    // Se estiver em modo túnel (exp.direct ou ngrok) ou na VPN Radmin (26.x), conecta no IP real do Wi-Fi
    if (
      hostUri.includes("exp.direct") ||
      hostUri.includes("ngrok") ||
      hostUri.startsWith("26.")
    ) {
      return "http://192.168.1.208:3333";
    }

    const ip = hostUri.split(":")[0];
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      return `http://${ip}:3333`;
    }
  }

  // Emulador Android Studio
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3333";
  }

  // iOS Simulator ou Web
  return "http://localhost:3333";
}

export const API_BASE_URL = getBaseUrl();

console.log("🌐 Conectando à API Backend em:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratamento de erros amigáveis
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await Storage.removeItem("auth_token");
      await Storage.removeItem("auth_user");
    }
    return Promise.reject(error);
  }
);
