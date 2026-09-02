import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { MarcoValidade } from "@/types/index";

interface MetricCardProps {
  label: string;
  count: number;
  marco: MarcoValidade | "TODOS";
  colorKey: "critico" | "alerta10d" | "alerta20d" | "alerta1m" | "alerta2m" | "normal";
  icon: React.ReactNode;
  isSelected?: boolean;
  onPress: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  count,
  colorKey,
  icon,
  isSelected,
  onPress,
}) => {
  const theme = Colors.marcos[colorKey];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? theme.color : theme.background,
          borderColor: theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#FFFFFF" },
          ]}
        >
          {icon}
        </View>
        <Text
          style={[
            styles.countText,
            { color: isSelected ? "#FFFFFF" : theme.color },
          ]}
          maxFontSizeMultiplier={1.25}
        >
          {count}
        </Text>
      </View>
      <Text
        style={[
          styles.labelText,
          { color: isSelected ? "#FFFFFF" : Colors.secondary },
        ]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: 116,
    minHeight: 104,
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 6,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
});
