# QA Report

**Mode:** strict
**New issues:** 3

## ✅ Passed
- reactionbar.anchor_guard (P0) — app/components/reactions/ReactionBar.tsx: Found
- store.status_read (P0) — app/hooks/useMessageStore.ts: read in statuses
- perf.dev_logs (P0) — app/hooks/useUIWatchDog.ts: logs guarded
- perf.dev_logs (P0) — app/hooks/useMessageStore.ts: logs guarded
- perf.dev_logs (P0) — app/hooks/useBotProvider.ts: logs guarded
- ui.layout.meta_inside (P1) — app/components/MessageWithReactions.tsx: meta positioned correctly
- ui.text.shrink_ok (P1) — app/components/MessageWithReactions.tsx: text shrink ok
- ui.pointer.safe (P1) — app/components/reactions/ReactionBar.tsx: pointer events safe
- perf.memo (P1) — app/components/MessageWithReactions.tsx: memo present
- perf.memo (P1) — app/components/ChatMessage.tsx: memo present
- secrets.env_gitignore (P0) — .gitignore: Found
- secrets.patterns (P0) — **/*.{ts,tsx,js,jsx}: no secrets found
- chatlist.scroll_close (P1) — app/components/ChatListWithReactions.tsx: Found
- perf.memo_bubble (P1) — app/components/MessageWithReactions.tsx: memo present
- perf.memo_bubble (P1) — app/components/ChatMessage.tsx: memo present
- perf.stable_handlers (P1) — app/components/ChatListWithReactions.tsx: callbacks memoized
- perf.stable_handlers (P1) — app/hooks/useReactionState.ts: callbacks memoized
- bubble.meta.pointerEvents (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.text.minWidth0 (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.noWidth100 (P1) — app/components/MessageWithReactions.tsx: OK
- bubble.paddingRight.meta (P1) — app/components/MessageWithReactions.tsx: paddingRight >= 28
- scroll.gate (P1) — app/components/ChatListWithReactions.tsx: Found
- reactionbar.guard (P0) — app/components/reactions/ReactionBar.tsx: Found
- reactionbar.pointerEvents (P1) — app/components/reactions/ReactionBar.tsx: Found
- anchor.touchXY (P1) — app/hooks/useReactionState.ts: touchXY support present
- status.read (P0) — app/hooks/useMessageStore.ts: OK
- .env.gitignore (P2) — .gitignore: Found
- secrets.regex (P0) — **/*.{ts,tsx,js,jsx}: no secrets found
- react.arrow_function_jsx (P1) — **/*.{ts,tsx}: OK
- react.unstable_handler (P1) — **/*.{ts,tsx}: OK
- react.map_without_callback (P1) — **/*.{ts,tsx}: OK
- react.nested_usecallback (P1) — **/*.{ts,tsx}: OK
- react.flatlist_render (P1) — **/*.{ts,tsx}: OK

## ⚠️ Warnings
- deps.heavy_inactive (P2) — package.json: heavy unused deps found **NEW**
- deps.unused (P2) — package.json: unused: @types/lodash, expo, expo-background-fetch, expo-blur, expo-camera... **NEW**
- bigfile.max_lines (P1) — app/**/*.{ts,tsx,js,jsx}: files too large: File exceeds max lines (323 > 300): app\components\ChatCore.tsx, File exceeds max lines (519 > 300): app\screens\ChatListScreen.tsx, File exceeds max lines (521 > 300): app\screens\ProfileScreen.tsx... **NEW**

## ❌ P0 Issues

Summary: Passed=33, Warnings=3, P0=0
