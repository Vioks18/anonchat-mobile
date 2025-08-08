# QA Report

## ✅ Passed
- reactionbar.anchor_guard (P0) — app/components/reactions/ReactionBar.tsx: Found
- store.status_read (P0) — app/hooks/useMessageStore.ts: read in statuses
- chatlist.scroll_close (P1) — app/components/ChatListWithReactions.tsx: Found
- reactionstate.keyboard_close (P1) — app/hooks/useReactionState.ts: keyboard listeners present
- perf.memo_bubble (P1) — app/components/MessageWithReactions.tsx: memo present
- perf.memo_bubble (P1) — app/components/ChatMessage.tsx: memo present
- perf.stable_handlers (P1) — app/components/ChatListWithReactions.tsx: callbacks memoized
- perf.stable_handlers (P1) — app/hooks/useReactions.ts: callbacks memoized
- reactionbar.clamp_flip_safe (P2) — app/components/reactions/ReactionBar.tsx: safe area + clamp logic present
- deps.unused (P2) — package.json: unused: @react-navigation/bottom-tabs, @react-navigation/elements, @react-navigation/native, expo, expo-auth-session, expo-background-fetch, expo-blur, expo-camera, expo-constants, expo-contacts, expo-crypto, expo-dev-client, expo-device, expo-document-picker, expo-file-system, expo-image, expo-image-picker, expo-linking, expo-location, expo-media-library, expo-network, expo-notifications, expo-secure-store, expo-sharing, expo-splash-screen, expo-sqlite, expo-status-bar, expo-symbols, expo-system-ui, expo-task-manager, expo-updates, expo-web-browser, react-dom, react-native-gesture-handler, react-native-haptic-feedback, react-native-reanimated, react-native-screens, react-native-swipe-list-view, react-native-web, react-native-webview

## ⚠️ Warnings
- chatlist.doubletap_window (P2) — app/components/ChatListWithReactions.tsx: double-tap window not in 220–300ms

## ❌ P0 Issues
- perf.dev_logs (P0) — app/hooks/useUIWatchDog.ts: dev logs not guarded
- perf.dev_logs (P0) — app/hooks/useMessageStore.ts: dev logs not guarded
- perf.dev_logs (P0) — app/hooks/useBotProvider.ts: dev logs not guarded

Summary: Passed=10, Warnings=1, P0=3
