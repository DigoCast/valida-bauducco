import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Rede CB",
  subtitle,
  rightAction,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 12;

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.brandTitle} maxFontSizeMultiplier={1.2}>
            REDE CB
          </Text>
          <Text style={styles.title} maxFontSizeMultiplier={1.25} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.2} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : user ? (
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.2} numberOfLines={1}>
              Operador: {user.nome} ({user.role === "ADMIN" ? "Gerente" : "Loja"})
            </Text>
          ) : null}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.secondary,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
  },
  brandTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 3,
  },
  title: {
    color: Colors.textLight,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D4C7BA",
    fontSize: 13,
    marginTop: 3,
    fontWeight: "500",
  },
  rightAction: {
    marginLeft: 12,
  },
});
