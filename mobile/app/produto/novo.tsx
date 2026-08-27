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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";
import { upsertProduto } from "@/services/produtos";
import { createLote } from "@/services/lotes";
import {
  ArrowLeft,
  Barcode,
  Calendar,
  Hash,
  Package,
  PlusCircle,
  Tag,
} from "lucide-react-native";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";

export default function NovoProdutoScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();

  const [codigoBarras, setCodigoBarras] = useState(barcode || "");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");

  // Dados do primeiro lote
  const [dataValidade, setDataValidade] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [numeroLote, setNumeroLote] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSalvar = async () => {
    if (!codigoBarras.trim() || !nome.trim()) {
      setErrorMessage("Por favor, preencha o código de barras e o nome do produto.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // 1. Cadastra o Produto
      const produto = await upsertProduto({
        codigoBarras: codigoBarras.trim(),
        nome: nome.trim(),
        categoria: categoria.trim() || undefined,
      });

      // 2. Se informou validade do primeiro lote, já cadastra junto!
      if (dataValidade.trim()) {
        let dataFormatada = dataValidade.trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataFormatada)) {
          const [dia, mes, ano] = dataFormatada.split("/");
          dataFormatada = `${ano}-${mes}-${dia}`;
        }

        if (dayjs(dataFormatada).isValid()) {
          const qtdNum = parseInt(quantidade, 10) || 1;
          await createLote({
            produtoId: produto.id,
            dataValidade: dataFormatada,
            quantidade: qtdNum,
            numeroLote: numeroLote.trim() || undefined,
          });
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso!", "Produto cadastrado com sucesso no sistema.", [
        {
          text: "Ver Produto",
          onPress: () => router.replace(`/produto/${produto.id}` as any),
        },
      ]);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Erro ao cadastrar produto. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 12;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Produto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Informações Básicas</Text>

          <CustomInput
            label="Código de Barras (EAN) *"
            placeholder="Ex: 7891000100101"
            value={codigoBarras}
            onChangeText={setCodigoBarras}
            keyboardType="numeric"
            icon={<Barcode size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="Nome do Produto *"
            placeholder="Ex: Panettone Tradicional 500g"
            value={nome}
            onChangeText={setNome}
            icon={<Package size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="Categoria (Opcional)"
            placeholder="Ex: Panettones, Biscoitos, Chocolates"
            value={categoria}
            onChangeText={setCategoria}
            icon={<Tag size={18} color={Colors.primary} />}
          />
        </View>

        {/* Card do Primeiro Lote */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Primeiro Lote (Opcional)</Text>
          <Text style={styles.cardSectionSubtitle}>
            Você já pode cadastrar a validade e quantidade que está entrando na loja.
          </Text>

          <CustomInput
            label="Data de Validade"
            placeholder="Ex: 2026-11-20 ou 20/11/2026"
            value={dataValidade}
            onChangeText={setDataValidade}
            icon={<Calendar size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="Quantidade de Itens"
            placeholder="Ex: 24"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
            icon={<Package size={18} color={Colors.primary} />}
          />

          <CustomInput
            label="Número do Lote"
            placeholder="Ex: L2026-B"
            value={numeroLote}
            onChangeText={setNumeroLote}
            icon={<Hash size={18} color={Colors.primary} />}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <CustomButton
          title="Salvar Produto no Sistema"
          icon={<PlusCircle size={20} color="#FFFFFF" />}
          onPress={handleSalvar}
          loading={loading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 4,
  },
  cardSectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  saveBtn: {
    marginTop: 8,
  },
});
