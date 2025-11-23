import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { StorageAdapter } from './storage/types';

export class FileStorage implements StorageAdapter {
  constructor(private baseDir: string) {
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
  }

  private path(key: string) {
    return join(this.baseDir, `${key}.json`);
  }

  readJson<T>(key: string, fallback: T): T {
    const filePath = this.path(key);
    if (!existsSync(filePath)) return fallback;
    try {
      const raw = readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`Failed to read JSON for key ${key}:`, err);
      return fallback;
    }
  }

  writeJson<T>(key: string, data: T): void {
    const filePath = this.path(key);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  listKeys(): string[] {
    if (!existsSync(this.baseDir)) return [];
    return readdirSync(this.baseDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, ''));
  }

  remove(key: string): void {
    const filePath = this.path(key);
    if (existsSync(filePath)) {
      rmSync(filePath);
    }
  }
}
