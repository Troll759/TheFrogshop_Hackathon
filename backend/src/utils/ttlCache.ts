interface CacheEntry<Value> {
  expiresAt: number;
  value: Value;
}

export class TtlCache<Value> {
  private readonly entries = new Map<string, CacheEntry<Value>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): Value | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: Value): void {
    this.entries.set(key, {
      expiresAt: Date.now() + this.ttlMs,
      value,
    });
  }

  clear(): void {
    this.entries.clear();
  }
}
