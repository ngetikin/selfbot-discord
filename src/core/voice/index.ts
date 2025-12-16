import { Collection } from 'discord.js-selfbot-v13';
import type { VoiceConnection } from 'discord.js-selfbot-v13';
import { randomUUID } from 'crypto';
import type { VoiceQueueItem, VoiceService } from '../../types/voice';
import type { AppEnv } from '../../types/env';
import type { Logger } from '../../utils/logger';
import { createVoiceAdapter } from './tts-adapter.js';
import type { AppClient } from '../client.js';
import { throttleJoin } from './voice-join.js';

export type VoiceDeps = {
  client: AppClient;
  env: AppEnv;
  logger: Logger;
};

export const createVoiceService = ({ client, env, logger }: VoiceDeps): VoiceService => {
  const adapter = createVoiceAdapter(env, logger);
  const queue = new Collection<string, VoiceQueueItem>();
  let processing = false;
  let connection: VoiceConnection | null = null;
  let leaveTimer: NodeJS.Timeout | null = null;

  const enqueue = (item: Omit<VoiceQueueItem, 'id'>): VoiceQueueItem => {
    const id = randomUUID();
    queue.set(id, { ...item, id });
    logger.debug('Voice item enqueued', { id, text: item.text });
    void processQueue();
    return { ...item, id };
  };

  const processQueue = async () => {
    if (processing) return;
    const next = queue.first();
    if (!next) return;
    processing = true;
    try {
      const targetChannel = next.channelId ?? env.VOICE_CHANNEL_ID;
      await ensureConnection(targetChannel);
      if (!connection) throw new Error('No voice connection available');
      await adapter.speak(next, connection);
      queue.delete(next.id);
    } catch (err) {
      logger.error('Voice processing failed', { err });
      // keep item for retry
      setTimeout(() => void processQueue(), 10_000);
    } finally {
      processing = false;
      if (queue.size > 0) void processQueue();
    }
  };

  const join = throttleJoin(async (channelId: string) => {
    connection = await client.voice.joinChannel(channelId, { selfDeaf: false });
    logger.info('Joined voice channel', { channelId });
    connection.on('disconnect', () => {
      logger.warn('Voice connection disconnected');
      connection = null;
    });
    connection.on('error', (err) => {
      logger.error('Voice connection error', { err });
      connection = null;
    });
    return undefined;
  }, 30_000);

  const ensureConnection = async (channelId: string): Promise<VoiceConnection> => {
    if (connection) return connection;
    let attempt = 0;
    const maxAttempts = 5;
    const joinWithRetry = async (): Promise<VoiceConnection> => {
      attempt += 1;
      try {
        await join(channelId);
        if (connection) return connection;
        throw new Error('No voice connection available after join');
      } catch (err) {
        logger.warn('Join voice failed', { attempt, err });
        connection = null;
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 5000));
          return joinWithRetry();
        }
        throw err;
      }
    };
    return joinWithRetry();
  };

  const leave = async () => {
    try {
      connection?.disconnect();
      connection = null;
      logger.info('Left voice channel');
    } catch (err) {
      logger.error('Leave voice failed', { err });
    }
  };

  const announce = (text: string, channelId = env.VOICE_CHANNEL_ID, lang = env.TTS_LANG) => {
    enqueue({ text, lang, channelId });
  };

  const init = () => {
    logger.info('Voice service initialized (stub)', {
      voiceChannelId: env.VOICE_CHANNEL_ID,
      ttsLang: env.TTS_LANG,
    });

    if (!leaveTimer) {
      leaveTimer = setInterval(
        () => {
          void (async () => {
            await leave();
            setTimeout(() => {
              void join(env.VOICE_CHANNEL_ID);
            }, 60_000);
          })();
        },
        30 * 60 * 1000,
      );
    }
  };

  return {
    enqueue,
    join,
    leave,
    announce,
    init,
  };
};

export type { VoiceService } from '../../types/voice';
