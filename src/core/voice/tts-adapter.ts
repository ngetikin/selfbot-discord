import type { AppEnv } from '../../types/env';
import type { Logger } from '../../utils/logger';
import type { TtsDriver, VoiceQueueItem } from '../../types/voice';

// Stub adaptor; integrate espeak-ng spawn here later.
export const createVoiceAdapter = (_env: AppEnv, logger: Logger): TtsDriver => {
  const speak = async (item: VoiceQueueItem) => {
    logger.info('TTS speak (stub)', { text: item.text, lang: item.lang, id: item.id });
    return Promise.resolve();
  };

  return { speak };
};
