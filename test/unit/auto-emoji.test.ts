import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Collection } from 'discord.js-selfbot-v13';
import { handleAutoEmoji } from '../../src/features/auto-emoji';
import type { AppContext } from '../../src/core/context';

const makeCtx = (): AppContext => ({
  env: {
    TOKEN: 'x',
    VOICE_CHANNEL_ID: '1',
    TARGET_GUILD_ID: '2',
    ADMIN_ROLE_IDS: '3',
    TTS_LANG: 'id-ID',
    LOG_LEVEL: 'info',
    EMOJI_CHANNEL_IDS: 'chan',
    RATE_MSGS_PER_MIN: '5',
    RATE_PRESENCE_MIN: '5',
    RATE_VOICE_JOIN_SEC: '30',
  },
  client: {} as any,
  scheduler: {} as any,
  storage: {} as any,
  voice: {} as any,
  logger: {
    warn: vi.fn(),
  } as any,
});

describe('auto emoji', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    vi.restoreAllMocks();
    Math.random = () => 0; // deterministic: count = 5, predictable picks
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('skips when channel not configured', async () => {
    const react = vi.fn();
    const message = {
      channel: { id: 'other' },
      author: { bot: false },
      react,
    } as any;

    await handleAutoEmoji(message, makeCtx());
    expect(react).not.toHaveBeenCalled();
  });

  it('reacts with guild non-animated emojis', async () => {
    const react = vi.fn().mockResolvedValue(undefined);
    const cache = new Collection<string, any>();
    cache.set('1', { animated: false, identifier: 'e1' });
    cache.set('2', { animated: true, identifier: 'e2' });
    cache.set('3', { animated: false, identifier: 'e3' });

    const message = {
      channel: { id: 'chan' },
      author: { bot: false },
      guild: { emojis: { cache } },
      react,
    } as any;

    await handleAutoEmoji(message, makeCtx());
    expect(react).toHaveBeenCalledTimes(2); // only non-animated
  });

  it('falls back to default emojis when no guild emojis', async () => {
    const react = vi.fn().mockResolvedValue(undefined);
    const message = {
      channel: { id: 'chan' },
      author: { bot: false },
      guild: undefined,
      react,
    } as any;

    await handleAutoEmoji(message, makeCtx());
    expect(react).toHaveBeenCalledTimes(5); // deterministic count via Math.random mock
  });
});
