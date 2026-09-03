/**
 * Paleta de Cores Oficial - ValidaCB (Tema Rede CB)
 */
export const Colors = {
  // Cores da Marca CB
  primary: "#D48B06", // Dourado / Mostarda nobre
  primaryDark: "#A86B00",
  primaryLight: "#FDE8B5",
  secondary: "#3D1E10", // Marrom Café / Chocolate Escuro
  secondaryDark: "#261108",
  secondaryLight: "#6B3B24",

  // Fundo & Superfícies
  background: "#F9F8F5", // Off-white suave
  cardBackground: "#FFFFFF",
  inputBackground: "#F2EFE9",
  divider: "#EBE6DC",

  // Textos
  text: "#2C1409",
  textMuted: "#7A685D",
  textLight: "#FFFFFF",

  // Semáforo dos 5 Marcos de Validade
  marcos: {
    // 1. Crítico / Vencido / 3 Dias
    critico: {
      color: "#E53935",
      background: "#FFEBEE",
      border: "#FFCDD2",
      badgeText: "Crítico (≤ 3d)",
    },
    // 2. Alerta 10 Dias
    alerta10d: {
      color: "#FB8C00",
      background: "#FFF3E0",
      border: "#FFE0B2",
      badgeText: "Alerta 10d",
    },
    // 3. Alerta 20 Dias
    alerta20d: {
      color: "#FBC02D",
      background: "#FFFDE7",
      border: "#FFF9C4",
      badgeText: "Alerta 20d",
    },
    // 4. Alerta 1 Mês (30 Dias)
    alerta1m: {
      color: "#1E88E5",
      background: "#E3F2FD",
      border: "#BBDEFB",
      badgeText: "Alerta 1 Mês",
    },
    // 5. Alerta 2 Meses (60 Dias)
    alerta2m: {
      color: "#8E24AA",
      background: "#F3E5F5",
      border: "#E1BEE7",
      badgeText: "Alerta 2 Meses",
    },
    // 6. Normal / Seguro
    normal: {
      color: "#43A047",
      background: "#E8F5E9",
      border: "#C8E6C9",
      badgeText: "Seguro (+2m)",
    },
  },

  // Status de Ação
  success: "#43A047",
  danger: "#E53935",
  warning: "#FB8C00",
  info: "#1E88E5",
};
