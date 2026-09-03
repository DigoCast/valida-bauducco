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
import { Lock, LogIn, Mail } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await signIn(email.trim(), senha);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      const msg =
        error.response?.data?.message ||
        (error.message ? `Erro de conexão: ${error.message}` : "E-mail ou senha inválidos. Tente novamente.");
      setErrorMessage(msg);
      Alert.alert("Aviso de Login", msg);
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 16;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Superior da Marca */}
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>REDE CB</Text>
          </View>
          <Text style={styles.appTitle}>ValidaCB</Text>
          <Text style={styles.appSubtitle}>
            Controle de validade e prevenção de perdas
          </Text>
        </View>

        {/* Card do Formulário */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>

          <CustomInput
            label="E-mail Corporativo"
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
            label="Senha de Acesso"
            placeholder="Digite sua senha"
            secureTextEntry
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setErrorMessage("");
            }}
            icon={<Lock size={18} color={Colors.primary} />}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <CustomButton
            title="Entrar no Sistema"
            onPress={handleLogin}
            loading={loading}
            icon={<LogIn size={18} color="#FFFFFF" />}
            style={styles.loginBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem acesso?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Cadastre-se</Text>
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
    marginBottom: 32,
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
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#D4C7BA",
    marginTop: 6,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  loginBtn: {
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
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
