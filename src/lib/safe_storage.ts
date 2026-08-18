/**
 * Deterministic Atomic Storage (Inspired by C# Thread Safety).
 * Prevents race conditions during local data synchronization.
 */

export class SafeStorage {
  private static locks = new Set<string>();

  static async atomicWrite(key: string, data: any): Promise<void> {
    if (this.locks.has(key)) {
      await this.waitForLock(key);
    }

    this.locks.add(key);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } finally {
      this.locks.delete(key);
    }
  }

  static read<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static async waitForLock(key: string): Promise<void> {
    while (this.locks.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
