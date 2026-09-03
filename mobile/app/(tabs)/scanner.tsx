import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { getProdutoByBarcode } from "@/services/produtos";
import { Barcode, Flashlight, FlashlightOff, Keyboard, RefreshCw, ScanLine } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 24) + 12;
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableTorch, setEnableTorch] = useState(false);

  // Modal para digitação manual de código de barras
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    const barcode = data.trim();
    if (!barcode) return;

    setScanned(true);
    setLoading(true);

    try {
      // Feedback tátil de bipe de sucesso
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Consulta a API
      try {
        const produto = await getProdutoByBarcode(barcode);
        // Produto já existe -> abre a tela do produto para ver lotes e adicionar novos
        router.push(`/produto/${produto.id}` as any);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Produto ainda não existe -> abre tela de cadastro rápido com o EAN preenchido
          router.push(`/produto/novo?barcode=${barcode}` as any);
        } else {
          Alert.alert("Erro de Conexão", "Não foi possível verificar o código de barras no servidor.");
        }
      }
    } finally {
      setLoading(false);
      // Reativa o scanner após 2 segundos
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const handleManualSubmit = async () => {
    const barcode = manualBarcode.trim();
    if (!barcode) return;

    setManualModalVisible(false);
    setManualBarcode("");
    handleBarcodeScanned({ data: barcode });
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <ScanLine size={64} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Acesso à Câmera Necessário</Text>
        <Text style={styles.permissionSubtitle}>
          Precisamos de acesso à câmera para ler os códigos de barras dos produtos.
        </Text>
        <CustomButton
          title="Permitir Câmera"
          onPress={requestPermission}
          style={{ width: "80%", marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={enableTorch}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay com Máscara e Mira */}
      <View style={styles.overlay}>
        {/* Topo com controles */}
        <View style={[styles.topControls, { marginTop: topPadding }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SCANNER EAN</Text>
          </View>

          <View style={styles.topButtonsRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setEnableTorch((prev) => !prev)}
            >
              {enableTorch ? (
                <FlashlightOff size={22} color="#FFFFFF" />
              ) : (
                <Flashlight size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setManualModalVisible(true)}
            >
              <Keyboard size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mira central */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticle}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <View style={styles.scanLaser} />
            )}
          </View>
          <Text style={styles.instructionText}>
            {loading
              ? "Buscando produto no sistema..."
              : "Aponte a câmera para o código de barras"}
          </Text>
        </View>

        {/* Rodapé com botão de digitação manual */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.manualEntryBtn}
            onPress={() => setManualModalVisible(true)}
          >
            <Barcode size={20} color={Colors.primary} />
            <Text style={styles.manualEntryBtnText}>Digitar Código Manualmente</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Digitação Manual */}
      <Modal
        visible={manualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Código de Barras</Text>
            <Text style={styles.modalSubtitle}>
              Digite o número do código de barras (EAN) do produto:
            </Text>

            <CustomInput
              placeholder="Ex: 7891000100101"
              keyboardType="numeric"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              autoFocus
              icon={<Barcode size={18} color={Colors.primary} />}
            />

            <View style={styles.modalButtonsRow}>
              <CustomButton
                title="Cancelar"
                variant="outline"
                onPress={() => setManualModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Buscar"
                onPress={handleManualSubmit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.secondary,
    marginTop: 16,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 20,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  badge: {
    backgroundColor: "rgba(61, 30, 16, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  topButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  reticleContainer: {
    alignItems: "center",
  },
  reticle: {
    width: 280,
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLaser: {
    width: 240,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  bottomBar: {
    marginBottom: 20,
    alignItems: "center",
  },
  manualEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  manualEntryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.secondary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
