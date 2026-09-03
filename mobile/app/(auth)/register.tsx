import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";
import { Lock, Mail, ShieldCheck, User, UserPlus } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 16;
  const { signUp } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<"OPERATOR" | "ADMIN">("OPERATOR");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (senha.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await signUp({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role,
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      const msg =
        error.response?.data?.message ||
        (error.message ? `Erro de conexão: ${error.message}` : "Erro ao cadastrar conta. Tente novamente.");
      setErrorMessage(msg);
      Alert.alert("Aviso de Cadastro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>REDE CB</Text>
          </View>
          <Text style={styles.appTitle}>Criar Conta</Text>
          <Text style={styles.appSubtitle}>
            Cadastre-se para acessar o sistema da loja
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Nome Completo *"
            placeholder="Ex: Carlos Silva"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              setErrorMessage("");
            }}
            icon={<User size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="E-mail Corporativo *"
            placeholder="ex: operador@validacb.com.br"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage("");
            }}
            icon={<Mail size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="Senha (Mínimo 6 caracteres) *"
            placeholder="Crie uma senha segura"
            secureTextEntry
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setErrorMessage("");
            }}
            icon={<Lock size={18} color={Colors.primary} />}
          />

          <Text style={styles.roleLabel}>Perfil de Acesso</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "OPERATOR" && styles.roleOptionSelected,
              ]}
              onPress={() => setRole("OPERATOR")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "OPERATOR" && styles.roleTextSelected,
                ]}
              >
                Operador de Loja
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "ADMIN" && styles.roleOptionSelected,
              ]}
              onPress={() => setRole("ADMIN")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "ADMIN" && styles.roleTextSelected,
                ]}
              >
                Gerente
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <CustomButton
            title="Finalizar Cadastro"
            onPress={handleRegister}
            loading={loading}
            icon={<UserPlus size={18} color="#FFFFFF" />}
            style={styles.registerBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui uma conta?</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  badgeContainer: {
    backgroundColor: "rgba(212, 139, 6, 0.2)",
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  appSubtitle: {
    fontSize: 13,
    color: "#D4C7BA",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5DEC9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.inputBackground,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FDF4E2",
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  roleTextSelected: {
    color: Colors.primaryDark,
    fontWeight: "800",
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  registerBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
