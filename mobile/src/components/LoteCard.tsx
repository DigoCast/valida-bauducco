import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Lote } from "@/types/index";
import { Calendar, CheckCircle2, PackageCheck, Trash2 } from "lucide-react-native";

interface LoteCardProps {
  lote: Lote;
  onPress?: () => void;
  onBaixaPress?: () => void;
  onDeletePress?: () => void;
}

export const LoteCard: React.FC<LoteCardProps> = ({
  lote,
  onPress,
  onBaixaPress,
  onDeletePress,
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
      <View style={styles.headerRow}>
        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={2}
            maxFontSizeMultiplier={1.25}
          >
            {lote.produto?.nome || "Produto Bauducco"}
          </Text>
          <Text
            style={styles.barcodeText}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            EAN: {lote.produto?.codigoBarras || "—"}
          </Text>
        </View>

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
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.detailsCol}>
          <View style={styles.detailItem}>
            <Calendar size={14} color={Colors.textMuted} />
            <Text
              style={styles.detailText}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.2}
            >
              Validade: <Text style={styles.boldText}>{lote.dataFormatada}</Text>
            </Text>
          </View>

          <View style={[styles.detailItem, { marginTop: 4 }]}>
            <PackageCheck size={14} color={Colors.textMuted} />
            <Text
              style={styles.detailText}
              numberOfLines={2}
              maxFontSizeMultiplier={1.2}
            >
              Qtd: <Text style={styles.boldText}>{lote.quantidade} un</Text>
              {lote.numeroLote ? ` • Lote: ${lote.numeroLote}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary,
    lineHeight: 22,
  },
  barcodeText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
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
    gap: 8,
  },
  detailsCol: {
    flex: 1,
    minWidth: 140,
    justifyContent: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  detailText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 6,
    flex: 1,
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
