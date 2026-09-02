import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { LoteCard } from "@/components/LoteCard";
import { BaixaModal } from "@/components/BaixaModal";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { darBaixaLote, deleteLote, getDashboard } from "@/services/lotes";
import { DashboardResponse, Lote, MarcoValidade } from "@/types/index";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function DashboardScreen() {
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMarco, setSelectedMarco] = useState<MarcoValidade | "TODOS">("TODOS");

  const { user } = useAuth();

  // Estado do modal de baixa
  const [loteParaBaixa, setLoteParaBaixa] = useState<Lote | null>(null);
  const [modalBaixaVisible, setModalBaixaVisible] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getDashboard();
      setData(response);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [fetchDashboard, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleFilterMarco = (marco: MarcoValidade | "TODOS") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMarco((prev) => (prev === marco ? "TODOS" : marco));
  };

  const handleOpenBaixa = (lote: Lote) => {
    setLoteParaBaixa(lote);
    setModalBaixaVisible(true);
  };

  const handleConfirmBaixa = async (status: "vendido" | "descartado") => {
    if (!loteParaBaixa) return;
    try {
      await darBaixaLote(loteParaBaixa.id, status);
      // Atualização otimista imediata na interface
      setData((prev) => {
        if (!prev) return null;
        const novosLotes = prev.lotes.filter((l) => l.id !== loteParaBaixa.id);
        return {
          ...prev,
          lotes: novosLotes,
        };
      });
      await fetchDashboard();
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível dar baixa no lote."
      );
    }
  };

  const handleDeleteLote = async (lote: Lote) => {
    Alert.alert(
      "Excluir Lote Definitivamente",
      `Deseja realmente apagar o lote ${lote.numeroLote || ""} do produto "${lote.produto?.nome || ""}" do banco de dados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteLote(lote.id);
              // Atualização otimista
              setData((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  lotes: prev.lotes.filter((l) => l.id !== lote.id),
                };
              });
              await fetchDashboard();
            } catch (error: any) {
              Alert.alert(
                "Erro",
                error.response?.data?.message || "Não foi possível excluir o lote."
              );
            }
          },
        },
      ]
    );
  };

  const lotesFiltrados =
    data?.lotes.filter((lote) => {
      if (selectedMarco === "TODOS") return true;
      if (selectedMarco === "3_DIAS") {
        return lote.marco === "3_DIAS" || lote.marco === "VENCIDO";
      }
      return lote.marco === selectedMarco;
    }) || [];

  return (
    <View style={styles.container}>
      <Header
        title="Painel de Validades"
        subtitle="Monitoramento diário por criticidade"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando informações da loja...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Seção 1: Métricas dos 5 Marcos de Validade */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Semáforo de Vencimento</Text>
            <TouchableOpacity
              onPress={() => setSelectedMarco("TODOS")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterAllText,
                  selectedMarco === "TODOS" && styles.filterAllActive,
                ]}
              >
                Ver Todos ({data?.metricas.totalLotesAtivos || 0})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsCarousel}
          >
            <MetricCard
              label="Críticos (≤ 3d)"
              count={data?.metricas.totalCriticos3Dias || 0}
              marco="3_DIAS"
              colorKey="critico"
              icon={<AlertCircle size={18} color={Colors.marcos.critico.color} />}
              isSelected={selectedMarco === "3_DIAS"}
              onPress={() => handleFilterMarco("3_DIAS")}
            />

            <MetricCard
              label="Alerta 10 dias"
              count={data?.metricas.totalAlerta10Dias || 0}
              marco="10_DIAS"
              colorKey="alerta10d"
              icon={<AlertTriangle size={18} color={Colors.marcos.alerta10d.color} />}
              isSelected={selectedMarco === "10_DIAS"}
              onPress={() => handleFilterMarco("10_DIAS")}
            />

            <MetricCard
              label="Alerta 20 dias"
              count={data?.metricas.totalAlerta20Dias || 0}
              marco="20_DIAS"
              colorKey="alerta20d"
              icon={<Clock size={18} color={Colors.marcos.alerta20d.color} />}
              isSelected={selectedMarco === "20_DIAS"}
              onPress={() => handleFilterMarco("20_DIAS")}
            />

            <MetricCard
              label="Alerta 1 mês"
              count={data?.metricas.totalAlerta1Mes || 0}
              marco="1_MES"
              colorKey="alerta1m"
              icon={<CalendarClock size={18} color={Colors.marcos.alerta1m.color} />}
              isSelected={selectedMarco === "1_MES"}
              onPress={() => handleFilterMarco("1_MES")}
            />

            <MetricCard
              label="Alerta 2 meses"
              count={data?.metricas.totalAlerta2Meses || 0}
              marco="2_MESES"
              colorKey="alerta2m"
              icon={<BellRing size={18} color={Colors.marcos.alerta2m.color} />}
              isSelected={selectedMarco === "2_MESES"}
              onPress={() => handleFilterMarco("2_MESES")}
            />

            <MetricCard
              label="Seguro (+2m)"
              count={data?.metricas.totalNormal || 0}
              marco="NORMAL"
              colorKey="normal"
              icon={<ShieldCheck size={18} color={Colors.marcos.normal.color} />}
              isSelected={selectedMarco === "NORMAL"}
              onPress={() => handleFilterMarco("NORMAL")}
            />
          </ScrollView>

          {/* Seção 2: Lista de Lotes Ordenados por Validade */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Layers size={18} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>
                {selectedMarco === "TODOS"
                  ? "Lotes Ativos na Loja"
                  : `Filtrado: ${selectedMarco.replace("_", " ")}`}
              </Text>
            </View>
            <Text style={styles.badgeCountText}>
              {lotesFiltrados.length} lote(s)
            </Text>
          </View>

          {lotesFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CheckCircle2 size={48} color={Colors.primary} />
              <Text style={styles.emptyTitle}>Nenhum lote nesta categoria</Text>
              <Text style={styles.emptySubtitle}>
                Excelente! Não há produtos pendentes para o filtro selecionado.
              </Text>
            </View>
          ) : (
            lotesFiltrados.map((lote) => (
              <LoteCard
                key={lote.id}
                lote={lote}
                onPress={() =>
                  lote.produto?.id &&
                  router.push({
                    pathname: `/produto/${lote.produto.id}`,
                    params: {
                      initialNome: lote.produto.nome,
                      initialCodigo: lote.produto.codigoBarras,
                      initialCategoria: lote.produto.categoria || "",
                    },
                  } as any)
                }
                onBaixaPress={() => handleOpenBaixa(lote)}
                onDeletePress={() => handleDeleteLote(lote)}
              />
            ))
          )}
        </ScrollView>
      )}

      <BaixaModal
        visible={modalBaixaVisible}
        lote={loteParaBaixa}
        onClose={() => setModalBaixaVisible(false)}
        onConfirm={handleConfirmBaixa}
        onDelete={
          loteParaBaixa
            ? async () => {
                await deleteLote(loteParaBaixa.id);
                fetchDashboard();
              }
            : undefined
        }
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.secondary,
  },
  filterAllText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  filterAllActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  metricsCarousel: {
    paddingRight: 20,
  },
  badgeCountText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "700",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.secondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
});
