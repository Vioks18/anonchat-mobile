import { AI_CONFIG } from '../../config/ai';

type Role = 'user' | 'assistant';
export type ChatTurn = { role: Role; text: string };

const API_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

export async function generateReply(params: {
  messages: ChatTurn[];
  systemInstructions?: string;
}): Promise<string> {
  if (!AI_CONFIG.isAIConfigured || !AI_CONFIG.apiKey) {
    throw new Error('AI key missing');
  }

  const model = AI_CONFIG.modelId;
  const api = API_URL(model, AI_CONFIG.apiKey);

  // Join last N user/assistant lines into a single content array
  const parts = params.messages
    .filter(m => m.text && m.text.trim().length > 0)
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));

  const body: any = {
    contents: parts,
    generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
    safetySettings: [],
  };
  if (params.systemInstructions) {
    body.systemInstruction = { role: 'system', parts: [{ text: params.systemInstructions }] };
  }

  // Simple retry (x3 exponential)
  let lastErr: any;
  for (let i = 0; i < 3; i++) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 25_000);
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: c.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
      }
      const json = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? '').join('') ?? '';
      if (!text) throw new Error('Empty response');
      return text.trim();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 400 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}
