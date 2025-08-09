# QA Report

**Mode:** strict
**New issues:** 5

## ✅ Passed
- reactionbar.anchor_guard (P0) — app/components/reactions/ReactionBar.tsx: Found
- store.status_read (P0) — app/hooks/useMessageStore.ts: read in statuses
- perf.dev_logs (P0) — app/hooks/useUIWatchDog.ts: logs guarded
- perf.dev_logs (P0) — app/hooks/useMessageStore.ts: logs guarded
- perf.dev_logs (P0) — app/hooks/useBotProvider.ts: logs guarded
- chatlist.scroll_close (P1) — app/components/ChatListWithReactions.tsx: Found
- perf.memo_bubble (P1) — app/components/MessageWithReactions.tsx: memo present
- perf.memo_bubble (P1) — app/components/ChatMessage.tsx: memo present
- perf.stable_handlers (P1) — app/components/ChatListWithReactions.tsx: callbacks memoized
- deps.unused (P2) — package.json: unused: @react-navigation/bottom-tabs, @react-navigation/elements, @react-navigation/native, expo, expo-auth-session, expo-background-fetch, expo-blur, expo-camera, expo-constants, expo-contacts, expo-crypto, expo-dev-client, expo-device, expo-document-picker, expo-file-system, expo-image, expo-image-picker, expo-linking, expo-location, expo-media-library, expo-network, expo-notifications, expo-secure-store, expo-sharing, expo-splash-screen, expo-sqlite, expo-status-bar, expo-symbols, expo-system-ui, expo-task-manager, expo-updates, expo-web-browser, react-dom, react-native-gesture-handler, react-native-haptic-feedback, react-native-reanimated, react-native-screens, react-native-swipe-list-view, react-native-web, react-native-webview
- bubble.meta.pointerEvents (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.text.minWidth0 (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.noWidth100 (P1) — app/components/MessageWithReactions.tsx: OK
- scroll.gate (P1) — app/components/ChatListWithReactions.tsx: Found
- reactionbar.guard (P0) — app/components/reactions/ReactionBar.tsx: Found
- reactionbar.pointerEvents (P1) — app/components/reactions/ReactionBar.tsx: Found
- anchor.touchXY (P1) — app/hooks/useReactionState.ts: touchXY support present
- status.read (P0) — app/hooks/useMessageStore.ts: OK
- .env.gitignore (P2) — .gitignore: Found
- secrets.regex (P0) — **/*.{ts,tsx,js,jsx}: no secrets found

## ⚠️ Warnings
- perf.stable_handlers (P1) — app/hooks/useReactions.ts: handlers not memoized **NEW**
- chatlist.doubletap_window (P2) — app/components/ChatListWithReactions.tsx: double-tap window not in 220–300ms **NEW**
- bubble.paddingRight.meta (P1) — app/components/MessageWithReactions.tsx: paddingRight < 28 **NEW**
- doubleTap.window (P1) — app/components/ChatListWithReactions.tsx: window not 220-300ms **NEW**

## ❌ P0 Issues
- gestures.doubletap.behavior (P0) — tapdiag-report.json: gesture issues: lateSecondTap: 2 > 0, duringScroll: 1 > 0, openLatencyP95: 300 > 300ms, openTooFar: 1 > 0 **NEW**

Summary: Passed=20, Warnings=4, P0=1
