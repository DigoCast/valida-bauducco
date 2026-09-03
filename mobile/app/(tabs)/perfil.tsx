import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "@/components/Header";
import { CustomButton } from "@/components/CustomButton";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/services/api";
import { triggerAlertaValidadeManual } from "@/services/lotes";
import {
  BellRing,
  Building2,
  CheckCircle2,
  Info,
  LogOut,
  Mail,
  Server,
  Shield,
  User,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const [triggerLoading, setTriggerLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sair do Sistema", "Deseja realmente encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          signOut();
        },
      },
    ]);
  };

  const handleTestNotification = async () => {
    setTriggerLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await triggerAlertaValidadeManual();
      Alert.alert(
        "Alerta Disparado!",
        `Varredura executada com sucesso!\nLotes monitorados: ${res.resultado.totalLotesMonitorados}\nDispositivos notificados: ${res.resultado.totalDispositivosNotificados}`
      );
    } catch (err: any) {
      Alert.alert(
        "Erro ao Testar",
        err.response?.data?.message || "Não foi possível disparar o alerta no servidor."
      );
    } finally {
      setTriggerLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Meu Perfil"
        subtitle="Configurações e dados de acesso"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card do Usuário */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <User size={32} color={Colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.nome || "Operador"}</Text>
              <View style={styles.roleBadge}>
                <Shield size={12} color={Colors.primaryDark} />
                <Text style={styles.roleBadgeText}>
                  {user?.role === "ADMIN" ? "Gerente de Loja" : "Operador de Loja"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Mail size={18} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>E-mail:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={[styles.infoItem, { marginTop: 10 }]}>
            <Building2 size={18} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>Loja:</Text>
            <Text style={styles.infoValue}>
              {user?.lojaId ? "Franquia Rede CB" : "Loja Principal"}
            </Text>
          </View>
        </View>

        {/* Card de Teste de Notificações */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BellRing size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Testar Notificação Push</Text>
          </View>

          <Text style={styles.cardDescription}>
            Dispara manualmente a rotina de varredura dos 5 marcos de validade e envia a notificação para este dispositivo.
          </Text>

          <CustomButton
            title="Disparar Alerta Agora"
            variant="outline"
            loading={triggerLoading}
            onPress={handleTestNotification}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Card de Conexão com Servidor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Server size={20} color={Colors.secondary} />
            <Text style={styles.cardTitle}>Servidor Backend</Text>
          </View>

          <View style={styles.infoItem}>
            <Info size={16} color={Colors.textMuted} />
            <Text style={styles.infoLabel}>API URL:</Text>
            <Text style={[styles.infoValue, { fontSize: 12 }]} numberOfLines={1}>
              {API_BASE_URL}
            </Text>
          </View>

          <View style={[styles.infoItem, { marginTop: 8 }]}>
            <CheckCircle2 size={16} color={Colors.success} />
            <Text style={styles.infoLabel}>Banco de Dados:</Text>
            <Text style={styles.infoValue}>PostgreSQL (Neon Serverless)</Text>
          </View>
        </View>

        {/* Botão de Logout */}
        <CustomButton
          title="Encerrar Sessão"
          variant="danger"
          icon={<LogOut size={18} color="#FFFFFF" />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FDF4E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.secondary,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF4E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 8,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: "700",
    marginLeft: 6,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.secondary,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: 8,
  },
});
