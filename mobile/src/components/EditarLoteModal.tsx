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
import { Calendar, CheckCircle2, Edit3, Hash, Package, X } from "lucide-react-native";
import { updateLote } from "@/services/lotes";
import { Lote, StatusLote } from "@/types/index";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";

interface EditarLoteModalProps {
  visible: boolean;
  lote: Lote | null;
  onClose: () => void;
  onSuccess: (loteAtualizado: Lote) => void;
}

const STATUS_OPTIONS: { value: StatusLote; label: string; color: string; bg: string }[] = [
  { value: "ativo", label: "Ativo no Estoque", color: Colors.success, bg: "#E8F5E9" },
  { value: "vendido", label: "Vendido", color: Colors.primary, bg: "#FDF4E2" },
  { value: "descartado", label: "Descartado", color: Colors.danger, bg: "#FEECEB" },
];

export const EditarLoteModal: React.FC<EditarLoteModalProps> = ({
  visible,
  lote,
  onClose,
  onSuccess,
}) => {
  const [dataValidade, setDataValidade] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [numeroLote, setNumeroLote] = useState("");
  const [status, setStatus] = useState<StatusLote>("ativo");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (lote) {
      let dataInicial = "";
      if (lote.dataFormatada && /^\d{2}\/\d{2}\/\d{4}$/.test(lote.dataFormatada)) {
        dataInicial = lote.dataFormatada;
      } else if (lote.dataValidade) {
        dataInicial = dayjs(lote.dataValidade).format("DD/MM/YYYY");
      }

      setDataValidade(dataInicial);
      setQuantidade(String(lote.quantidade || 1));
      setNumeroLote(lote.numeroLote || "");
      setStatus(lote.status || "ativo");
      setErrorMessage("");
    }
  }, [lote, visible]);

  const handleSalvar = async () => {
    if (!lote) return;

    let dataFormatada = dataValidade.trim();
    if (!dataFormatada) {
      setErrorMessage("Informe a data de validade.");
      return;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataFormatada)) {
      const [dia, mes, ano] = dataFormatada.split("/");
      dataFormatada = `${ano}-${mes}-${dia}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataFormatada) || !dayjs(dataFormatada).isValid()) {
      setErrorMessage("Data inválida. Use o formato DD/MM/AAAA ou AAAA-MM-DD.");
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    if (isNaN(qtdNum) || qtdNum < 1) {
      setErrorMessage("A quantidade deve ser de no mínimo 1 unidade.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const loteAtualizado = await updateLote(lote.id, {
        dataValidade: dataFormatada,
        quantidade: qtdNum,
        numeroLote: numeroLote.trim() || null,
        status,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess(loteAtualizado);
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar lote:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        error.response?.data?.message || "Não foi possível atualizar o lote. Tente novamente.";
      setErrorMessage(msg);
      Alert.alert("Erro na Atualização", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!lote) return null;

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
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Edit3 size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} maxFontSizeMultiplier={1.25}>
                  Editar Lote
                </Text>
                <Text
                  style={styles.subtitle}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  {lote.produto?.nome || "Produto"}
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
            {/* Campo Data de Validade */}
            <CustomInput
              label="Data de Validade *"
              placeholder="Ex: 15/10/2026 ou 2026-10-15"
              value={dataValidade}
              onChangeText={(text) => {
                setDataValidade(text);
                setErrorMessage("");
              }}
              icon={<Calendar size={18} color={Colors.primary} />}
            />

            {/* Campo Quantidade */}
            <CustomInput
              label="Quantidade de Itens *"
              placeholder="Ex: 10"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={(text) => {
                setQuantidade(text);
                setErrorMessage("");
              }}
              icon={<Package size={18} color={Colors.primary} />}
            />

            {/* Campo Número do Lote */}
            <CustomInput
              label="Número / Identificador do Lote (Opcional)"
              placeholder="Ex: L2026-B"
              value={numeroLote}
              onChangeText={(text) => {
                setNumeroLote(text);
                setErrorMessage("");
              }}
              icon={<Hash size={18} color={Colors.primary} />}
            />

            {/* Status do Lote */}
            <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.2}>
              Status do Lote:
            </Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusChip,
                      { borderColor: isSelected ? opt.color : "#E8E2D6" },
                      isSelected && { backgroundColor: opt.bg },
                    ]}
                    onPress={() => {
                      setStatus(opt.value);
                      setErrorMessage("");
                    }}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <CheckCircle2 size={14} color={opt.color} style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.statusChipText,
                        { color: isSelected ? opt.color : Colors.textMuted },
                        isSelected && styles.statusChipTextSelected,
                      ]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errorMessage ? (
              <Text style={styles.errorText} maxFontSizeMultiplier={1.2}>
                {errorMessage}
              </Text>
            ) : null}

            {/* Botão de Salvar Alterações */}
            <CustomButton
              title="Salvar Alterações"
              onPress={handleSalvar}
              loading={loading}
              icon={<Edit3 size={18} color="#FFFFFF" />}
              style={styles.saveBtn}
            />

            {/* Botão Cancelar */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText} maxFontSizeMultiplier={1.2}>
                Cancelar
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
    paddingBottom: 32,
    maxHeight: "90%",
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: -4,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E2D6",
  },
  statusChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  statusChipTextSelected: {
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
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
