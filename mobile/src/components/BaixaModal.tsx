import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Lote } from "@/types/index";
import { CheckCircle2, Edit3, Trash2, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface BaixaModalProps {
  visible: boolean;
  lote: Lote | null;
  onClose: () => void;
  onConfirm: (status: "vendido" | "descartado") => Promise<void>;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
}

export const BaixaModal: React.FC<BaixaModalProps> = ({
  visible,
  lote,
  onClose,
  onConfirm,
  onDelete,
  onEdit,
}) => {
  const [loadingAction, setLoadingAction] = useState<"vendido" | "descartado" | "excluir" | null>(
    null
  );

  if (!lote) return null;

  const dataValidadeExibicao =
    lote.dataFormatada && /^\d{2}\/\d{2}\/\d{4}$/.test(lote.dataFormatada)
      ? lote.dataFormatada
      : (() => {
          const ymd = lote.dataValidade ? lote.dataValidade.slice(0, 10) : "";
          if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
            const [ano, mes, dia] = ymd.split("-");
            return `${dia}/${mes}/${ano}`;
          }
          return lote.dataFormatada || "—";
        })();

  const handleAction = async (status: "vendido" | "descartado") => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoadingAction(status);
      await onConfirm(status);
      onClose();
    } catch (error) {
      console.error("Erro ao dar baixa:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      "Excluir Lote Definitivamente",
      "Tem certeza que deseja apagar este lote permanentemente do banco de dados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setLoadingAction("excluir");
              await onDelete();
              onClose();
            } catch (error) {
              console.error("Erro ao excluir lote:", error);
            } finally {
              setLoadingAction(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Ações do Lote</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.productSummary}>
                <Text style={styles.productName}>
                  {lote.produto?.nome || "Produto"}
                </Text>
                <Text style={styles.productDetails}>
                  Validade: {dataValidadeExibicao} • Qtd: {lote.quantidade} un
                </Text>
                {lote.numeroLote && (
                  <Text style={styles.productDetails}>
                    Lote: {lote.numeroLote}
                  </Text>
                )}
              </View>

              <Text style={styles.promptText}>
                Selecione a ação desejada para este lote:
              </Text>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.vendidoBtn]}
                  onPress={() => handleAction("vendido")}
                  disabled={loadingAction !== null}
                  activeOpacity={0.8}
                >
                  {loadingAction === "vendido" ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Dar Baixa (Vendido)</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.descartadoBtn]}
                  onPress={() => handleAction("descartado")}
                  disabled={loadingAction !== null}
                  activeOpacity={0.8}
                >
                  {loadingAction === "descartado" ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Trash2 size={20} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Dar Baixa (Descartar Vencido)</Text>
                    </>
                  )}
                </TouchableOpacity>

                {onEdit && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => {
                      onClose();
                      onEdit();
                    }}
                    disabled={loadingAction !== null}
                    activeOpacity={0.8}
                  >
                    <Edit3 size={20} color={Colors.primary} />
                    <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>
                      Alterar Dados do Lote
                    </Text>
                  </TouchableOpacity>
                )}

                {onDelete && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={handleDelete}
                    disabled={loadingAction !== null}
                    activeOpacity={0.8}
                  >
                    {loadingAction === "excluir" ? (
                      <ActivityIndicator color={Colors.danger} size="small" />
                    ) : (
                      <>
                        <Trash2 size={20} color={Colors.danger} />
                        <Text style={[styles.actionBtnText, { color: Colors.danger }]}>
                          Excluir Registro Permanentemente
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.secondary,
  },
  closeBtn: {
    padding: 4,
  },
  productSummary: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  promptText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    fontWeight: "500",
  },
  actionsContainer: {
    gap: 10,
  },
  actionBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  vendidoBtn: {
    backgroundColor: Colors.success,
  },
  descartadoBtn: {
    backgroundColor: Colors.warning,
  },
  editBtn: {
    backgroundColor: "#FDF4E2",
    borderWidth: 1,
    borderColor: "rgba(212, 139, 6, 0.4)",
  },
  deleteBtn: {
    backgroundColor: "#FEECEB",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
