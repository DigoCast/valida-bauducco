import React, { createContext, useContext, useEffect, useState } from "react";
import { Storage } from "@/utils/storage";
import { Usuario } from "@/types/index";
import { getProfileRequest, loginRequest, registerRequest, RegisterDTO } from "@/services/auth";
import { registerForPushNotificationsAsync } from "@/services/notifications";

interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: RegisterDTO) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await Storage.getItem("auth_token");
        const storedUser = await Storage.getItem("auth_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Valida o token no backend em background
          try {
            const profile = await getProfileRequest();
            setUser(profile.user);
            await Storage.setItem("auth_user", JSON.stringify(profile.user));
          } catch {
            // Se o token expirou, limpa a sessão
            await Promise.all([
              Storage.removeItem("auth_token"),
              Storage.removeItem("auth_user"),
            ]);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, senha: string) {
    setIsLoading(true);
    try {
      const response = await loginRequest(email, senha);
      setUser(response.user);
      setToken(response.token);

      await Storage.setItem("auth_token", response.token);
      await Storage.setItem("auth_user", JSON.stringify(response.user));

      // Registra notificações em background
      registerForPushNotificationsAsync().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(data: RegisterDTO) {
    setIsLoading(true);
    try {
      const response = await registerRequest(data);
      setUser(response.user);
      setToken(response.token);

      await Storage.setItem("auth_token", response.token);
      await Storage.setItem("auth_user", JSON.stringify(response.user));

      registerForPushNotificationsAsync().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await Promise.all([
        Storage.removeItem("auth_token"),
        Storage.removeItem("auth_user"),
      ]);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
