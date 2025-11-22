import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleDailyMeme } from '../../src/features/daily-meme';
import type { AppContext } from '../../src/core/context';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('daily meme scheduler', () => {
  const now = Date.now();
  vi.setSystemTime(now);

  const sendMock = vi.fn();
  const ctx: AppContext = {
    env: {
      TOKEN: 'x',
      VOICE_CHANNEL_ID: '1',
      TARGET_GUILD_ID: '2',
      ADMIN_ROLE_IDS: '3',
      TTS_LANG: 'id-ID',
      LOG_LEVEL: 'info',
      MEME_CHANNEL_ID: 'chan',
      MEME_DEBUG_NOW: 'true',
    },
    client: {
      channels: {
        cache: new Map([
          [
            'chan',
            {
              send: sendMock,
            },
          ],
        ]),
      },
    } as unknown as AppContext['client'],
    scheduler: {} as AppContext['scheduler'],
    storage: {} as AppContext['storage'],
    voice: {} as AppContext['voice'],
    logger: {
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    } as AppContext['logger'],
  };

  afterEach(() => {
    sendMock.mockClear();
    vi.restoreAllMocks();
  });

  it('sends once on debug now', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { url: 'http://x', title: 't' } }),
    } as unknown as Response);

    scheduleDailyMeme(ctx);
    await wait(10);
    expect(sendMock).toHaveBeenCalled();
  });
});
