import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Message } from 'discord.js-selfbot-v13';
import { scheduleDailyMeme } from '../../src/features/daily-meme';
import type { AppContext } from '../../src/core/context';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('daily meme scheduler', () => {
  const now = Date.now();
  vi.setSystemTime(now);

  type FakeMessage = Pick<Message, 'react'>;
  const sendMock = vi.fn<[unknown?], Promise<FakeMessage>>();
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
      RATE_MSGS_PER_MIN: '5',
      RATE_PRESENCE_MIN: '5',
      RATE_VOICE_JOIN_SEC: '30',
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
    vi.unstubAllGlobals?.();
  });

  it('menandai @everyone dan react emoji acak ketika mengirim meme', async () => {
    const reactMock = vi.fn().mockResolvedValue(undefined);
    const messageMock: FakeMessage = { react: reactMock };
    sendMock.mockResolvedValueOnce(messageMock);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { url: 'http://x', title: 't' } }),
    } as unknown as Response);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // deterministik: 5 emoji pertama

    scheduleDailyMeme(ctx);
    await wait(30);

    const warnMock = ctx.logger.warn as unknown as ReturnType<typeof vi.fn>;

    expect(sendMock).toHaveBeenCalledWith({
      content: '@everyone',
      files: ['http://x'],
    });
    expect(warnMock).not.toHaveBeenCalled();
    expect(reactMock).toHaveBeenCalledTimes(5);
    expect(randomSpy).toHaveBeenCalled();
  });

  it('sends once on debug now', async () => {
    const reactMock = vi.fn().mockResolvedValue(undefined);
    sendMock.mockResolvedValueOnce({ react: reactMock });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { url: 'http://x', title: 't' } }),
    } as unknown as Response);

    scheduleDailyMeme(ctx);
    await wait(10);
    expect(sendMock).toHaveBeenCalled();
  });
});
