# Refactoring Log

## Extractions from ChatCore.tsx

| Original Lines | New File | Date | Commit Hash |
|---------------|----------|------|-------------|
| 47-113 | app/constants/themes.ts | 2025-01-16 | 47d9488 |

## CORRIDOR MODE Analysis (2025-01-16)

**Targets analyzed:**
1. ❌ Message status constants & icon map → Already extracted to `app/types/message.ts` and `MessageWithReactions.tsx`
2. ❌ Time formatting helper → Not found in ChatCore.tsx
3. ❌ Keyboard/layout thresholds → Only StyleSheet values, no separate constants
4. ❌ Haptics glue → Not found in ChatCore.tsx  
5. ❌ Header/search/theme menu keys → No separate string constants found

**Result:** No further extractions possible - ChatCore.tsx is already well-modularized.