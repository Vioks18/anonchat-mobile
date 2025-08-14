export type ChatTurn = { role: 'user' | 'assistant'; text: string };

export const AI_FLAGS = {
  streaming: false, // TODO: implement streaming later
};
