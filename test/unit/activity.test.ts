import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AppContext } from '../../src/core/context';
import { startActivityRotation } from '../../src/features/activity';

const makeCtx = (): AppContext => {
  const setActivity = vi.fn();
  return {
    env: {
      TOKEN: 'x',
      VOICE_CHANNEL_ID: '1',
      TARGET_GUILD_ID: '2',
      ADMIN_ROLE_IDS: '3',
      TTS_LANG: 'id-ID',
      LOG_LEVEL: 'info',
      ACTIVITY_MESSAGES: 'Play1,Play2',
      RATE_MSGS_PER_MIN: '5',
      RATE_PRESENCE_MIN: '5',
      RATE_VOICE_JOIN_SEC: '30',
    },
    client: { user: { setActivity } },
    scheduler: {} as AppContext['scheduler'],
    storage: {} as AppContext['storage'],
    voice: {} as AppContext['voice'],
    logger: { debug: vi.fn() } as AppContext['logger'],
  };
};

describe('activity rotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('cycles activities every 5 minutes', () => {
    const ctx = makeCtx();

    startActivityRotation(ctx);

    expect(ctx.client.user.setActivity).toHaveBeenCalledTimes(1);
    expect(ctx.client.user.setActivity).toHaveBeenLastCalledWith({
      name: 'Play1',
      type: 'PLAYING',
    });

    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(ctx.client.user.setActivity).toHaveBeenLastCalledWith({
      name: 'Play2',
      type: 'PLAYING',
    });

    vi.advanceTimersByTime(5 * 60 * 1000);
    expect(ctx.client.user.setActivity).toHaveBeenLastCalledWith({
      name: 'Play1',
      type: 'PLAYING',
    });
  });
});
