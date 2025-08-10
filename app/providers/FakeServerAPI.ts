// Fake server API for message deletion
// Simulates server latency and responses

export async function deleteForAll(messageIds: string[]): Promise<{ok: true}> {
  // Simulate server latency
  const latency = Math.random() * 200 + 200; // 200-400ms
  await new Promise(resolve => setTimeout(resolve, latency));
  
  // Always resolve successfully for now
  return { ok: true };
}
