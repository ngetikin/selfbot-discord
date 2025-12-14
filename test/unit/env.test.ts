import { describe, it, expect } from 'vitest';
import { loadEnv } from '../../src/utils/env';

describe('loadEnv', () => {
  it('throws when required env missing', () => {
    const original = { ...process.env };
    process.env = {};
    expect(() => loadEnv()).toThrow();
    process.env = original;
  });

  it('loads minimal env', () => {
    const original = { ...process.env };
    process.env = {
      TOKEN: 'x',
      VOICE_CHANNEL_ID: '1',
      TARGET_GUILD_ID: '2',
      ADMIN_ROLE_IDS: '3',
      TTS_LANG: 'id-ID',
      LOG_LEVEL: 'info',
    };
    const env = loadEnv();
    expect(env.TOKEN).toBe('x');
    expect(env.TTS_LANG).toBe('id-ID');
    process.env = original;
  });

  it('rejects too many activity messages', () => {
    const original = { ...process.env };
    const longList = Array.from({ length: 25 }, (_, i) => `a${i}`).join(',');
    process.env = {
      TOKEN: 'x',
      VOICE_CHANNEL_ID: '1',
      TARGET_GUILD_ID: '2',
      ADMIN_ROLE_IDS: '3',
      TTS_LANG: 'id-ID',
      ACTIVITY_MESSAGES: longList,
    };
    expect(() => loadEnv()).toThrow();
    process.env = original;
  });
});
