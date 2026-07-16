function fallbackUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export function createUuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? fallbackUuid();
}

const appSessionId = createUuid();
export function getAppSessionId(): string { return appSessionId; }
