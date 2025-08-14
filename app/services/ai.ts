const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:8787'; // replace with your LAN IP on device tests

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function askBot(message: string, history: ChatTurn[] = []) {
  const res = await fetch(`${BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { reply: string };
  return data.reply;
}
