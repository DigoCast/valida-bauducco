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
import { CustomInput } from "./CustomInput";
import { CustomButton } from "./CustomButton";
import { Calendar, Hash, Package, X } from "lucide-react-native";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";

interface NovoLoteModalProps {
  visible: boolean;
  produtoId: string;
  produtoNome: string;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: {
    produtoId: string;
    numeroLote?: string;
    dataValidade: string;
    quantidade: number;
  }) => Promise<void>;
}

export const NovoLoteModal: React.FC<NovoLoteModalProps> = ({
  visible,
  produtoId,
  produtoNome,
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const [dataValidade, setDataValidade] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [numeroLote, setNumeroLote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSalvar = async () => {
    // Validação da data no formato YYYY-MM-DD ou DD/MM/YYYY
    let dataFormatada = dataValidade.trim();

    if (!dataFormatada) {
      setError("Informe a data de validade.");
      return;
    }

    // Se o usuário digitou DD/MM/YYYY converte para YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataFormatada)) {
      const [dia, mes, ano] = dataFormatada.split("/");
      dataFormatada = `${ano}-${mes}-${dia}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataFormatada) || !dayjs(dataFormatada).isValid()) {
      setError("Data inválida. Use o formato AAAA-MM-DD ou DD/MM/AAAA.");
      return;
    }

    const qtdNum = parseInt(quantidade, 10);
    if (isNaN(qtdNum) || qtdNum < 1) {
      setError("A quantidade deve ser de no mínimo 1 unidade.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        produtoId,
        numeroLote: numeroLote.trim() || undefined,
        dataValidade: dataFormatada,
        quantidade: qtdNum,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Limpa os campos
      setDataValidade("");
      setQuantidade("1");
      setNumeroLote("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao cadastrar lote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Novo Lote</Text>
                  <Text style={styles.productSubtitle} numberOfLines={1}>
                    {produtoNome}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <CustomInput
                label="Data de Validade *"
                placeholder="Ex: 2026-10-15 ou 15/10/2026"
                value={dataValidade}
                onChangeText={(text) => {
                  setDataValidade(text);
                  setError("");
                }}
                icon={<Calendar size={18} color={Colors.primary} />}
              />

              <CustomInput
                label="Quantidade de Itens *"
                placeholder="Ex: 12"
                keyboardType="numeric"
                value={quantidade}
                onChangeText={(text) => {
                  setQuantidade(text);
                  setError("");
                }}
                icon={<Package size={18} color={Colors.primary} />}
              />

              <CustomInput
                label="Número do Lote (Opcional)"
                placeholder="Ex: L2026-A"
                value={numeroLote}
                onChangeText={setNumeroLote}
                icon={<Hash size={18} color={Colors.primary} />}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <CustomButton
                title="Cadastrar Lote"
                onPress={handleSalvar}
                loading={loading}
                style={{ marginTop: 8 }}
              />
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.secondary,
  },
  productSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
  },
});
