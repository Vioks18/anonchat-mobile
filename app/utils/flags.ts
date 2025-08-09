// Feature flags for AnonChat

export const flags = {
  bubbleAnim: process.env.EXPO_PUBLIC_BUBBLE_ANIM === '1',
  reactionsV2: process.env.EXPO_PUBLIC_REACTIONS_V2 === '1',
  headerActions: process.env.EXPO_PUBLIC_HEADER_ACTIONS === '1',
  qaGuard: process.env.EXPO_PUBLIC_QA_GUARD === '1',
};
