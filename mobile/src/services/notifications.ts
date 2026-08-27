import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "./api";

// Detecta se o aplicativo está sendo executado no cliente Expo Go
const isExpoGo = Constants.appOwnership === "expo";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // No Expo Go a partir do SDK 53/54, o módulo nativo de push remoto é desativado para evitar erros
  if (isExpoGo && Platform.OS === "android") {
    console.log(
      "ℹ️ [Push Notifications] Desativadas no Expo Go Android (requer build nativo de produção)."
    );
    return null;
  }

  try {
    // Carregamento sob demanda para não disparar side-effects na inicialização do Expo Go
    const Notifications = require("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("validade-alertas", {
        name: "Alertas de Validade",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#E53935",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    const token = pushTokenData?.data;

    if (token) {
      await api.post("/api/dispositivos/token", { token });
      console.log("📲 Push token registrado no backend:", token);
      return token;
    }
  } catch (error) {
    console.log("ℹ️ Push notifications indisponíveis neste ambiente:", error);
  }

  return null;
}
