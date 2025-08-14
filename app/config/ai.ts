import Constants from 'expo-constants';

const fromExtra =
  (Constants as any)?.expoConfig?.extra?.GEMINI_API_KEY ??
  (Constants as any)?.manifest?.extra?.GEMINI_API_KEY ??
  null;

export const AI_CONFIG = {
  apiKey: typeof fromExtra === 'string' ? fromExtra : null,
  isAIConfigured: typeof fromExtra === 'string' && fromExtra.length > 10,
  modelId: 'gemini-1.5-flash',
};
