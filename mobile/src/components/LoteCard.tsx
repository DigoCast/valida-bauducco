import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Lote } from "@/types/index";
import { Calendar, CheckCircle2, Edit3, PackageCheck, Trash2 } from "lucide-react-native";

interface LoteCardProps {
  lote: Lote;
  onPress?: () => void;
  onBaixaPress?: () => void;
  onDeletePress?: () => void;
  onEditPress?: () => void;
}

export const LoteCard: React.FC<LoteCardProps> = ({
  lote,
  onPress,
  onBaixaPress,
  onDeletePress,
  onEditPress,
}) => {
  const getBadgeStyle = () => {
    switch (lote.marco) {
      case "VENCIDO":
      case "3_DIAS":
        return Colors.marcos.critico;
      case "10_DIAS":
        return Colors.marcos.alerta10d;
      case "20_DIAS":
        return Colors.marcos.alerta20d;
      case "1_MES":
        return Colors.marcos.alerta1m;
      case "2_MESES":
        return Colors.marcos.alerta2m;
      case "NORMAL":
      default:
        return Colors.marcos.normal;
    }
  };

  const badgeTheme = getBadgeStyle();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* 1. Barra Superior: Badge de Criticidade e EAN */}
      <View style={styles.topStatusRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeTheme.background, borderColor: badgeTheme.border },
          ]}
        >
          <Text
            style={[styles.badgeText, { color: badgeTheme.color }]}
            maxFontSizeMultiplier={1.2}
          >
            {lote.descricaoStatus}
          </Text>
        </View>

        <Text
          style={styles.barcodeText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          EAN: {lote.produto?.codigoBarras || "—"}
        </Text>
      </View>

      {/* 2. Nome do Produto em 100% da Largura do Card */}
      <Text
        style={styles.productName}
        maxFontSizeMultiplier={1.25}
      >
        {lote.produto?.nome || "Produto"}
      </Text>

      <View style={styles.divider} />

      {/* 3. Rodapé: Informações de Validade, Quantidade e Botões de Ação */}
      <View style={styles.footerRow}>
        <View style={styles.detailsCol}>
          <View style={styles.detailItem}>
            <Calendar size={14} color={Colors.textMuted} />
            <Text
              style={styles.detailText}
              maxFontSizeMultiplier={1.2}
            >
              Validade: <Text style={styles.boldText}>{lote.dataFormatada}</Text>
            </Text>
          </View>

          <View style={[styles.detailItem, { marginTop: 4 }]}>
            <PackageCheck size={14} color={Colors.textMuted} />
            <Text
              style={styles.detailText}
              maxFontSizeMultiplier={1.2}
            >
              Qtd: <Text style={styles.boldText}>{lote.quantidade} un</Text>
              {lote.numeroLote ? ` • Lote: ${lote.numeroLote}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onEditPress && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPress}
              activeOpacity={0.7}
              accessibilityLabel="Editar lote"
            >
              <Edit3 size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {onBaixaPress && lote.status === "ativo" && (
            <TouchableOpacity
              style={styles.baixaButton}
              onPress={onBaixaPress}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={16} color={Colors.primary} />
              <Text
                style={styles.baixaButtonText}
                maxFontSizeMultiplier={1.2}
              >
                Baixa
              </Text>
            </TouchableOpacity>
          )}

          {onDeletePress && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDeletePress}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  barcodeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  productName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.secondary,
    lineHeight: 24,
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  detailsCol: {
    flex: 1,
    minWidth: 140,
    justifyContent: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textMuted,
    flexShrink: 1,
  },
  boldText: {
    color: Colors.secondary,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  baixaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF4E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  baixaButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "#FDF4E2",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 139, 6, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#FEECEB",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
  },
});
