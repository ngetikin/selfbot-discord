import { describe, it, expect } from 'vitest';
import { loadEnv } from '../../src/utils/env';

describe('env defaults', () => {
  it('fills defaults for log level', () => {
    const original = { ...process.env };
    process.env = {
      TOKEN: 'x',
      VOICE_CHANNEL_ID: '1',
      TARGET_GUILD_ID: '2',
      ADMIN_ROLE_IDS: '3',
      TTS_LANG: 'id-ID',
    };
    const env = loadEnv();
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.RATE_MSGS_PER_MIN).toBe('5');
    expect(env.RATE_PRESENCE_MIN).toBe('5');
    expect(env.RATE_VOICE_JOIN_SEC).toBe('30');
    process.env = original;
  });
});
