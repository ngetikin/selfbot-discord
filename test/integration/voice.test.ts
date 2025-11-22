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
  } as any);

const env = {
  TOKEN: 'x',
  VOICE_CHANNEL_ID: 'chan',
  TARGET_GUILD_ID: 'g',
  ADMIN_ROLE_IDS: 'r',
  TTS_LANG: 'id-ID',
  LOG_LEVEL: 'info',
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retries join and processes queue', async () => {
    const client = makeClient();
    const voice = createVoiceService({ client, env, logger });
    voice.enqueue({ text: 'hi', lang: 'id-ID', channelId: 'chan' });
    await voice.join('chan');
    expect(mockJoin).toHaveBeenCalled();
  });
});
