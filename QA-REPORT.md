# QA Report

**Mode:** strict
**New issues:** 7

## ✅ Passed
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
- bubble.meta.pointerEvents (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.text.minWidth0 (P1) — app/components/MessageWithReactions.tsx: Found
- bubble.noWidth100 (P1) — app/components/MessageWithReactions.tsx: OK
- bubble.paddingRight.meta (P1) — app/components/MessageWithReactions.tsx: paddingRight >= 28
- scroll.gate (P1) — app/components/ChatListWithReactions.tsx: Found
- reactionbar.pointerEvents (P1) — app/components/reactions/ReactionBar.tsx: Found
- anchor.touchXY (P1) — app/hooks/useReactionState.ts: touchXY support present
- status.read (P0) — app/hooks/useMessageStore.ts: OK
- .env.gitignore (P2) — .gitignore: Found
- secrets.regex (P0) — **/*.{ts,tsx,js,jsx}: no secrets found

## ⚠️ Warnings
- deps.heavy_inactive (P2) — package.json: heavy unused deps found **NEW**
- perf.stable_handlers (P1) — app/hooks/useReactions.ts: handlers not memoized **NEW**
- deps.unused (P2) — package.json: unused: @react-navigation/bottom-tabs, @react-navigation/elements, @react-navigation/native, expo, expo-auth-session... **NEW**
- bigfile.max_lines (P1) — app/**/*.{ts,tsx,js,jsx}: files too large: File exceeds max lines (335 > 300): app\components\chat\ChatCore.styles.ts, File exceeds max lines (407 > 300): app\context\ChatLogicProvider.tsx **NEW**

## ❌ P0 Issues
- reactionbar.anchor_guard (P0) — app/components/reactions/ReactionBar.tsx: Missing: if (!visible || !anchor) return null; **NEW**
- store.status_read (P0) — app/hooks/useMessageStore.ts: read missing in statuses **NEW**
- reactionbar.guard (P0) — app/components/reactions/ReactionBar.tsx: Missing: if (!visible || !anchor) return null; **NEW**

Summary: Passed=24, Warnings=4, P0=3
