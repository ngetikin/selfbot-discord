import type { AppEnv } from '../types/env';
import type { Logger } from '../utils/logger';

export type VoiceService = {
  init: () => void;
};

export const createVoiceService = (env: AppEnv, logger: Logger): VoiceService => {
  const init = () => {
    logger.info('Voice service initialized (stub)', {
      voiceChannelId: env.VOICE_CHANNEL_ID,
      ttsLang: env.TTS_LANG,
    });
  };

  return { init };
};
