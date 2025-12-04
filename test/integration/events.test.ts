/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { registerEvents } from '../../src/events';

describe('events wiring', () => {
  it('registers handlers without throwing', () => {
    const on = vi.fn();
    const once = vi.fn();
    const client = { on, once, user: { id: 'me' } };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    const env = {
      TARGET_GUILD_ID: 'g',
      VOICE_CHANNEL_ID: 'c',
      TTS_LANG: 'id-ID',
      TOKEN: 'x',
      ADMIN_ROLE_IDS: 'r',
      RATE_MSGS_PER_MIN: '5',
      RATE_PRESENCE_MIN: '5',
      RATE_VOICE_JOIN_SEC: '30',
    };
    const ctx = {
      scheduler: { snapshot: () => [] },
      storage: { listKeys: () => [] },
      voice: { join: vi.fn() },
    };
    registerEvents(client as any, logger as any, env as any, ctx as any);
    expect(on).toHaveBeenCalled();
    expect(once).toHaveBeenCalled();
  });
});
