import { describe, it, expect, vi } from 'vitest';
import { registerEvents } from '../../src/events';

describe('events wiring', () => {
  it('registers handlers without throwing', () => {
    const on = vi.fn();
    const once = vi.fn();
    const client: any = { on, once, user: { id: 'me' } };
    const logger: any = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    const env: any = {
      TARGET_GUILD_ID: 'g',
      VOICE_CHANNEL_ID: 'c',
      TTS_LANG: 'id-ID',
      TOKEN: 'x',
      ADMIN_ROLE_IDS: 'r',
    };
    const ctx: any = { scheduler: { snapshot: () => [] }, storage: { listKeys: () => [] }, voice: { join: vi.fn() } };
    registerEvents(client, logger, env, ctx);
    expect(on).toHaveBeenCalled();
    expect(once).toHaveBeenCalled();
  });
});
