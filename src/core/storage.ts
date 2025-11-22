import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export class FileStorage {
  constructor(private baseDir: string) {
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
  }

  readJson<T>(key: string, fallback: T): T {
    const filePath = join(this.baseDir, `${key}.json`);
    if (!existsSync(filePath)) return fallback;
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  }

  writeJson<T>(key: string, data: T): void {
    const filePath = join(this.baseDir, `${key}.json`);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
