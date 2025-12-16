/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createVoiceService } from '../../src/core/voice';
import type { VoiceConnection } from 'discord.js-selfbot-v13';

const mockJoin = vi.fn();
const mockDisconnect = vi.fn();

const mockConnection = {
  disconnect: mockDisconnect,
  on: vi.fn(),
  playAudio: vi.fn().mockReturnValue({
    once: (event: string, cb: () => void) => {
      if (event === 'finish') cb();
      return undefined;
    },
  }),
} as unknown as VoiceConnection;

const makeClient = () =>
  ({
    voice: {
      joinChannel: mockJoin,
    },
  }) as unknown as { voice: { joinChannel: typeof mockJoin } };

const env = {
  TOKEN: 'x',
  VOICE_CHANNEL_ID: 'chan',
  TARGET_GUILD_ID: 'g',
  ADMIN_ROLE_IDS: 'r',
  TTS_LANG: 'id-ID',
  LOG_LEVEL: 'info',
  RATE_MSGS_PER_MIN: '5',
  RATE_PRESENCE_MIN: '5',
  RATE_VOICE_JOIN_SEC: '30',
};

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
} as any;

describe('voice service', () => {
  beforeEach(() => {
    mockJoin.mockResolvedValue(mockConnection);
    mockDisconnect.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries join and processes queue', async () => {
    const client = makeClient();
    const voice = createVoiceService({ client, env, logger });
    voice.enqueue({ text: 'hi', lang: 'id-ID', channelId: 'chan' });
    await voice.join('chan');
    expect(mockJoin).toHaveBeenCalled();
  });

  it('auto leave setiap 30 menit dan join lagi setelah 1 menit', async () => {
    const client = makeClient();
    const voice = createVoiceService({ client, env, logger });
    await voice.join('chan');
    voice.init();

    vi.advanceTimersByTime(30 * 60 * 1000);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60 * 1000);
    expect(mockJoin).toHaveBeenCalledTimes(2); // initial + rejoin
  });
});
