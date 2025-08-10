// Feature flags for AnonChat

export const flags = {
  bubbleAnim: true,
  bubbleV2: true, // Новая верстка пузырьков
  reactionsV2: process.env.EXPO_PUBLIC_REACTIONS_V2 === '1',
  headerActions: process.env.EXPO_PUBLIC_HEADER_ACTIONS === '1',
  qaGuard: process.env.EXPO_PUBLIC_QA_GUARD === '1',
};
