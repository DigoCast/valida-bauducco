import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/CustomButton";
import { Barcode, Edit3, Package, Tag, Trash2, X } from "lucide-react-native";
import { deleteProduto, updateProduto } from "@/services/produtos";
import { Produto } from "@/types/index";
import * as Haptics from "expo-haptics";

interface EditarProdutoModalProps {
  visible: boolean;
  produto: Produto | null;
  onClose: () => void;
  onSuccess: (produtoAtualizado: Produto) => void;
  onDeleted?: () => void;
}

const CATEGORIAS_SUGERIDAS = [
  "Panettones",
  "Biscoitos",
  "Bolos",
  "Chocolates",
  "Pães",
  "Bebidas",
  "Cafeteria",
  "Outros",
];

export const EditarProdutoModal: React.FC<EditarProdutoModalProps> = ({
  visible,
  produto,
  onClose,
  onSuccess,
  onDeleted,
}) => {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (produto) {
      setNome(produto.nome || "");
      setCategoria(produto.categoria || "");
      setCodigoBarras(produto.codigoBarras || "");
      setErrorMessage("");
    }
  }, [produto, visible]);

  const handleSave = async () => {
    if (!produto) return;

    if (!nome.trim()) {
      setErrorMessage("O nome do produto é obrigatório.");
      return;
    }

    if (!codigoBarras.trim()) {
      setErrorMessage("O código de barras (EAN) é obrigatório.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const atualizado = await updateProduto(produto.id, {
        nome: nome.trim(),
        categoria: categoria.trim() || null,
        codigoBarras: codigoBarras.trim(),
      });
      onSuccess(atualizado);
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      const msg =
        error.response?.data?.message || "Não foi possível atualizar o produto. Tente novamente.";
      setErrorMessage(msg);
      Alert.alert("Erro na Atualização", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!produto) return;

    Alert.alert(
      "Excluir Produto",
      `Deseja realmente excluir "${produto.nome}" e todos os seus lotes cadastrados do sistema? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir Definitivamente",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteProduto(produto.id);
              onClose();
              if (onDeleted) {
                onDeleted();
              }
            } catch (error: any) {
              const msg =
                error.response?.data?.message || "Não foi possível excluir o produto.";
              Alert.alert("Erro", msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!produto) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header do Modal */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Edit3 size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} maxFontSizeMultiplier={1.25}>
                  Editar Produto
                </Text>
                <Text
                  style={styles.subtitle}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  Altere as informações do catálogo
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CustomInput
              label="Nome do Produto *"
              placeholder="Ex: Panettone Bauducco 500g"
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setErrorMessage("");
              }}
              icon={<Package size={18} color={Colors.primary} />}
            />

            <CustomInput
              label="Código de Barras (EAN) *"
              placeholder="Ex: 7891234567890"
              keyboardType="number-pad"
              value={codigoBarras}
              onChangeText={(text) => {
                setCodigoBarras(text);
                setErrorMessage("");
              }}
              icon={<Barcode size={18} color={Colors.primary} />}
            />

            <CustomInput
              label="Categoria"
              placeholder="Ex: Panettones, Biscoitos, etc."
              value={categoria}
              onChangeText={(text) => {
                setCategoria(text);
                setErrorMessage("");
              }}
              icon={<Tag size={18} color={Colors.primary} />}
            />

            {/* Chips de Categorias Sugeridas */}
            <Text style={styles.chipLabel} maxFontSizeMultiplier={1.2}>
              Sugestões de Categoria:
            </Text>
            <View style={styles.chipRow}>
              {CATEGORIAS_SUGERIDAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    categoria === cat && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setCategoria(cat);
                    setErrorMessage("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      categoria === cat && styles.chipTextSelected,
                    ]}
                    maxFontSizeMultiplier={1.2}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errorMessage ? (
              <Text style={styles.errorText} maxFontSizeMultiplier={1.2}>
                {errorMessage}
              </Text>
            ) : null}

            {/* Botão de Salvar */}
            <CustomButton
              title="Salvar Alterações"
              onPress={handleSave}
              loading={loading}
              icon={<Edit3 size={18} color="#FFFFFF" />}
              style={styles.saveBtn}
            />

            {/* Botão de Excluir Produto */}
            <TouchableOpacity
              style={styles.deleteProductBtn}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={Colors.danger} />
              <Text style={styles.deleteProductText} maxFontSizeMultiplier={1.2}>
                {deleting ? "Excluindo..." : "Excluir Produto Definitivamente"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FDF4E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 139, 6, 0.2)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.inputBackground,
  },
  formContent: {
    maxHeight: 480,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: -4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E2D6",
  },
  chipSelected: {
    backgroundColor: "#FDF4E2",
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: "800",
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  saveBtn: {
    marginTop: 8,
  },
  deleteProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#FFCCC7",
    marginBottom: 16,
  },
  deleteProductText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
});
