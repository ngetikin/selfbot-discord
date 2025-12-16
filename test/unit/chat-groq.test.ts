import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../../src/core/context';

const makeCtx = (): AppContext => ({
  env: {
    TOKEN: 'x',
    VOICE_CHANNEL_ID: '1',
    TARGET_GUILD_ID: '2',
    ADMIN_ROLE_IDS: '3',
    TTS_LANG: 'id-ID',
    LOG_LEVEL: 'info',
    GROQ_API_KEY: 'key',
    GROQ_MODEL: 'model-a',
    RATE_MSGS_PER_MIN: '5',
    RATE_PRESENCE_MIN: '5',
    RATE_VOICE_JOIN_SEC: '30',
  },
  client: { user: { id: 'me' } } as AppContext['client'],
  scheduler: {} as AppContext['scheduler'],
  storage: {} as AppContext['storage'],
  voice: {} as AppContext['voice'],
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  } as AppContext['logger'],
});

const makeMessage = (): Message => {
  const reply = vi.fn();
  const message = {
    content: '<@me> hello',
    channel: { id: 'chan' },
    reply: reply.mockResolvedValue(undefined),
    author: { bot: false },
    // discord.js-selfbot-v13 mention helper is different; we mimic minimal has()
    mentions: { has: (id: string) => id === 'me' },
  };
  return message as unknown as Message;
};

describe('Groq chat handler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rate limits per channel', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'hi' } }] }),
    } as unknown as Response);

    const { handleGroqChat } = await import('../../src/features/chat-groq');

    await handleGroqChat(message, ctx);
    await handleGroqChat(message, ctx);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to next model on 404', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    const replySpy = vi.spyOn(message, 'reply');

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'fallback' } }] }),
      } as unknown as Response);

    const { handleGroqChat } = await import('../../src/features/chat-groq');

    await handleGroqChat(message, ctx);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(replySpy).toHaveBeenCalledWith('fallback');
  });

  it('mengabaikan pesan dari diri sendiri', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    message.author = { id: 'me', bot: false } as Message['author'];
    const { handleGroqChat } = await import('../../src/features/chat-groq');
    global.fetch = vi.fn();

    await handleGroqChat(message, ctx);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('mengabaikan mention massal @everyone/@here', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    message.mentions.everyone = true as boolean;
    const { handleGroqChat } = await import('../../src/features/chat-groq');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await handleGroqChat(message, ctx);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('membalas mood saat rate limit', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    const replySpy = vi.spyOn(message, 'reply');
    const { handleGroqChat } = await import('../../src/features/chat-groq');
    // pertama isi cache rate, kedua kena limit
    await handleGroqChat(message, ctx);
    replySpy.mockClear();
    await handleGroqChat(message, ctx);
    expect(replySpy).toHaveBeenCalledTimes(1);
  });

  it('membalas mood saat API error', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    const replySpy = vi.spyOn(message, 'reply');
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    const { handleGroqChat } = await import('../../src/features/chat-groq');

    await handleGroqChat(message, ctx);

    expect(replySpy).toHaveBeenCalled();
  });
});
