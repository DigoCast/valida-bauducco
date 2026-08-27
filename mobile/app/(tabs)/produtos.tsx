import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { CustomInput } from "@/components/CustomInput";
import { Colors } from "@/constants/colors";
import { listProdutos } from "@/services/produtos";
import { Produto } from "@/types/index";
import { ChevronRight, Package, Search, Tag } from "lucide-react-native";

export default function ProdutosScreen() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProdutos = useCallback(async (query?: string) => {
    try {
      const response = await listProdutos(query);
      setProdutos(response);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos(search);
  }, [fetchProdutos, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProdutos(search);
  };

  const renderItem = ({ item }: { item: Produto }) => {
    const lotesAtivos = item.lotes || [];
    const totalItens = lotesAtivos.reduce((acc, l) => acc + l.quantidade, 0);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/produto/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleCol}>
            <Text style={styles.nomeProduto} numberOfLines={1}>
              {item.nome}
            </Text>
            <Text style={styles.codigoBarras}>EAN: {item.codigoBarras}</Text>
          </View>
          <ChevronRight size={20} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          {item.categoria ? (
            <View style={styles.categoryBadge}>
              <Tag size={12} color={Colors.primaryDark} />
              <Text style={styles.categoryBadgeText}>{item.categoria}</Text>
            </View>
          ) : (
            <View />
          )}

          <View style={styles.lotesBadge}>
            <Text style={styles.lotesBadgeText}>
              {lotesAtivos.length} lote(s) • {totalItens} un
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Catálogo de Produtos"
        subtitle="Itens cadastrados na loja"
      />

      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Buscar por nome, EAN ou categoria..."
          value={search}
          onChangeText={setSearch}
          icon={<Search size={18} color={Colors.primary} />}
          style={{ height: 46 }}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color={Colors.primary} />
              <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? `Nenhum resultado para "${search}".`
                  : "Ainda não há produtos cadastrados na loja. Use o scanner para cadastrar."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
  },
  codigoBarras: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF4E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: "600",
  },
  lotesBadge: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lotesBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.secondary,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
