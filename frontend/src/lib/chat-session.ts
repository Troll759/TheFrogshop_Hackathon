// Module-level token used to scope in-memory chat state.
// Resetting it (e.g. when the user lands on the home page) starts a fresh conversation.
let token = String(Date.now());
const listeners = new Set<() => void>();

export function getChatSession(): string {
  return token;
}

export function resetChatSession(): void {
  token = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  listeners.forEach((l) => l());
}

export function subscribeChatSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
