import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info" | "warning";
type ToastOpts = { title?: string; message: string; type?: ToastType; durationMs?: number; onPress?: () => void };

type Ctx = { show: (opts: ToastOpts) => void };
const ToastCtx = createContext<Ctx | null>(null);

// Singleton — можно импортировать и вызывать без хука: toast.show({...})
let _show: (opts: ToastOpts) => void = () => {};
export const toast = { show: (opts: ToastOpts) => _show(opts) };

const palette: Record<ToastType, { bg: string; dot: string }> = {
  success: { bg: "#0B1220", dot: "#22C55E" },
  error:   { bg: "#0B1220", dot: "#EF4444" },
  info:    { bg: "#0B1220", dot: "#3B82F6" },
  warning: { bg: "#0B1220", dot: "#F59E0B" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ visible: boolean } & ToastOpts>({ visible: false, message: "" });
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 20, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => setState(s => ({ ...s, visible: false })));
  }, []);

  const show = useCallback((opts: ToastOpts) => {
    setState({ visible: true, ...opts, type: opts.type ?? "success", durationMs: opts.durationMs ?? 2200 });
  }, []);

  useEffect(() => { _show = show; return () => { _show = () => {}; }; }, [show]);

  useEffect(() => {
    if (!state.visible) return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(hide, state.durationMs);
    return () => clearTimeout(t);
  }, [state.visible, state.durationMs, hide]);

  const ctx = useMemo<Ctx>(() => ({ show }), [show]);
  const colors = palette[state.type ?? "success"];

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      {state.visible && (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View style={[styles.wrap, { paddingBottom: insets.bottom + 12 }]}>
            <Animated.View style={[styles.toast, { opacity: fade, transform: [{ translateY: slide }], backgroundColor: colors.bg }]}>
              <View style={[styles.dot, { backgroundColor: colors.dot }]} />
              <Pressable style={{ flex: 1 }} onPress={state.onPress}>
                {!!state.title && <Text style={styles.title}>{state.title}</Text>}
                <Text style={styles.msg} numberOfLines={3}>{state.message}</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 12 },
  toast: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", width: "100%", maxWidth: 600,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { color: "#E5E7EB", fontWeight: "700", marginBottom: 2 },
  msg: { color: "#CBD0D8" },
});
