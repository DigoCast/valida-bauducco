import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { LoteCard } from "@/components/LoteCard";
import { BaixaModal } from "@/components/BaixaModal";
import { NovoLoteModal } from "@/components/NovoLoteModal";
import { CustomButton } from "@/components/CustomButton";
import { getProdutoById } from "@/services/produtos";
import { createLote, darBaixaLote, deleteLote } from "@/services/lotes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lote, Produto } from "@/types/index";
import {
  ArrowLeft,
  Barcode,
  Layers,
  Package,
  Plus,
  Tag,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function ProdutoDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modais
  const [novoLoteVisible, setNovoLoteVisible] = useState(false);
  const [baixaModalVisible, setBaixaModalVisible] = useState(false);
  const [loteParaBaixa, setLoteParaBaixa] = useState<Lote | null>(null);

  const fetchProduto = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getProdutoById(id);
      setProduto(data);
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do produto.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduto();
  }, [fetchProduto]);

  const handleOpenBaixa = (lote: Lote) => {
    setLoteParaBaixa(lote);
    setBaixaModalVisible(true);
  };

  const handleConfirmBaixa = async (status: "vendido" | "descartado") => {
    if (!loteParaBaixa) return;
    try {
      await darBaixaLote(loteParaBaixa.id, status);
      // Atualização otimista imediata na tela
      setProduto((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lotes: prev.lotes.filter((l) => l.id !== loteParaBaixa.id),
        };
      });
      await fetchProduto();
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
      `Deseja realmente apagar o lote ${lote.numeroLote || ""} do produto "${produto?.nome || ""}" do banco de dados?`,
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
              setProduto((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  lotes: prev.lotes.filter((l) => l.id !== lote.id),
                };
              });
              await fetchProduto();
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

  const handleCreateLote = async (data: {
    produtoId: string;
    numeroLote?: string;
    dataValidade: string;
    quantidade: number;
  }) => {
    await createLote(data);
    fetchProduto();
  };

  if (loading || !produto) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const lotesAtivos = (produto.lotes || []).filter((l) => l.status === "ativo");
  const totalEstoque = lotesAtivos.reduce((acc, l) => acc + l.quantidade, 0);

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 12;

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Card Principal do Produto */}
        <View style={styles.productCard}>
          <View style={styles.badgeRow}>
            <View style={styles.eanBadge}>
              <Barcode size={14} color={Colors.primaryDark} />
              <Text style={styles.eanBadgeText}>{produto.codigoBarras}</Text>
            </View>

            {produto.categoria ? (
              <View style={styles.categoryBadge}>
                <Tag size={14} color={Colors.textMuted} />
                <Text style={styles.categoryBadgeText}>{produto.categoria}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.productName}>{produto.nome}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total em Estoque</Text>
              <Text style={styles.statValue}>{totalEstoque} un</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lotes Ativos</Text>
              <Text style={styles.statValue}>{lotesAtivos.length} lote(s)</Text>
            </View>
          </View>
        </View>

        {/* Botão de Adicionar Novo Lote */}
        <CustomButton
          title="Adicionar Novo Lote"
          icon={<Plus size={20} color="#FFFFFF" />}
          onPress={() => setNovoLoteVisible(true)}
          style={styles.addLoteBtn}
        />

        {/* Seção de Lotes */}
        <View style={styles.sectionHeader}>
          <Layers size={18} color={Colors.secondary} />
          <Text style={styles.sectionTitle}>Lotes Cadastrados</Text>
        </View>

        {lotesAtivos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={40} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Nenhum lote ativo</Text>
            <Text style={styles.emptySubtitle}>
              Todos os lotes deste produto já tiveram baixa ou ainda não foram cadastrados.
            </Text>
          </View>
        ) : (
          lotesAtivos.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={{ ...lote, produto }}
              onBaixaPress={() => handleOpenBaixa({ ...lote, produto })}
              onDeletePress={() => handleDeleteLote({ ...lote, produto })}
            />
          ))
        )}
      </ScrollView>

      {/* Modais */}
      <NovoLoteModal
        visible={novoLoteVisible}
        produtoId={produto.id}
        produtoNome={produto.nome}
        onClose={() => setNovoLoteVisible(false)}
        onSuccess={fetchProduto}
        onSubmit={handleCreateLote}
      />

      <BaixaModal
        visible={baixaModalVisible}
        lote={loteParaBaixa}
        onClose={() => setBaixaModalVisible(false)}
        onConfirm={handleConfirmBaixa}
        onDelete={
          loteParaBaixa
            ? async () => {
                await deleteLote(loteParaBaixa.id);
                fetchProduto();
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
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  eanBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF4E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  eanBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  productName: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.secondary,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.secondary,
    marginTop: 2,
  },
  addLoteBtn: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.secondary,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.secondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});
