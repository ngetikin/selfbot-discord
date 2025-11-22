import { Collection } from 'discord.js-selfbot-v13';
import { randomUUID } from 'crypto';
import type { VoiceQueueItem, VoiceService } from '../../types/voice';
import type { AppEnv } from '../../types/env';
import type { Logger } from '../../utils/logger';
import { createVoiceAdapter } from './tts-adapter';
import type { AppClient } from '../client';
import { throttleJoin } from './voice-join';

export type VoiceDeps = {
  client: AppClient;
  env: AppEnv;
  logger: Logger;
};

export const createVoiceService = ({ client, env, logger }: VoiceDeps): VoiceService => {
  const adapter = createVoiceAdapter(env, logger);
  const queue = new Collection<string, VoiceQueueItem>();
  let processing = false;

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
      if (next.channelId) {
        await join(next.channelId);
      }
      await adapter.speak(next);
      queue.delete(next.id);
    } catch (err) {
      logger.error('Voice processing failed', { err });
      queue.delete(next.id);
    } finally {
      processing = false;
      if (queue.size > 0) void processQueue();
    }
  };

  const join = throttleJoin(async (channelId: string) => {
    await client.voice.joinChannel(channelId, { selfDeaf: true });
    logger.info('Joined voice channel', { channelId });
  }, 30_000);

  const leave = async () => {
    try {
      await client.user?.voice?.disconnect();
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
