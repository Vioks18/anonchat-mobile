import React, { useEffect, useRef } from "react";
import { Modal, View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";

export type AlertType = "success" | "error" | "info" | "warning";

export type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoCloseMs?: number;
  closeOnBackdrop?: boolean;
};

const palette: Record<AlertType, { chip: string; emoji: string }> = {
  success: { chip: "#22C55E", emoji: "✅" },
  error:   { chip: "#EF4444", emoji: "⛔️" },
  info:    { chip: "#3B82F6", emoji: "ℹ️" },
  warning: { chip: "#F59E0B", emoji: "⚠️" },
};

export default function CustomAlert({
  visible,
  title = "Готово",
  message = "",
  type = "info",
  confirmText = "Ок",
  cancelText = "Отмена",
  showCancel = false,
  onConfirm,
  onCancel,
  autoCloseMs,
  closeOnBackdrop = true,
}: CustomAlertProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.92, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !autoCloseMs) return;
    const t = setTimeout(() => onConfirm?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [visible, autoCloseMs, onConfirm]);

  const colors = palette[type];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeOnBackdrop ? (onCancel ?? onConfirm) : undefined} />
      </Animated.View>

      <View style={styles.centerWrap} pointerEvents="box-none">
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: colors.chip }]}>
              <Text style={styles.badgeText}>{colors.emoji}</Text>
            </View>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
          </View>

          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.row}>
            {showCancel && (
              <Pressable onPress={onCancel} style={[styles.btn, styles.btnGhost]}>
                <Text style={[styles.btnText, styles.btnGhostText]}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable onPress={onConfirm} style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnText}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    width: "100%", maxWidth: 420, backgroundColor: "#111215", borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  badge: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 18, color: "#fff" },
  title: { flex: 1, color: "#E5E7EB", fontSize: 18, fontWeight: "700" },
  message: { color: "#AEB2BA", fontSize: 15, lineHeight: 20, marginBottom: 14, marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  btn: { height: 44, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnGhostText: { color: "#D1D5DB" },
});
