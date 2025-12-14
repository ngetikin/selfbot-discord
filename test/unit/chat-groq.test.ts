import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const makeCtx = () => ({
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
  client: { user: { id: 'me' } } as any,
  scheduler: {} as any,
  storage: {} as any,
  voice: {} as any,
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  } as any,
});

const makeMessage = () => {
  const reply = vi.fn();
  return {
    content: '<@me> hello',
    channel: { id: 'chan' },
    reply: reply.mockResolvedValue(undefined),
    author: { bot: false },
    // discord.js-selfbot-v13 mention helper is different; we mimic minimal has()
    mentions: { has: (id: string) => id === 'me' },
  } as any;
};

describe('Groq chat handler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rate limits per channel', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'hi' } }] }),
    } as any);

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
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'fallback' } }] }),
      } as any);

    const { handleGroqChat } = await import('../../src/features/chat-groq');

    await handleGroqChat(message, ctx);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(replySpy).toHaveBeenCalledWith('fallback');
  });

  it('mengabaikan pesan dari diri sendiri', async () => {
    const ctx = makeCtx();
    const message = makeMessage();
    message.author = { id: 'me' } as any;
    const { handleGroqChat } = await import('../../src/features/chat-groq');
    global.fetch = vi.fn();

    await handleGroqChat(message, ctx);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
