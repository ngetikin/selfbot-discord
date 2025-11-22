import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';

export const readyHandler = (client: AppClient, logger: Logger, env: AppEnv) => {
  client.once('ready', () => {
    logger.info('Ready event received', {
      user: client.user?.tag,
      guild: env.TARGET_GUILD_ID,
      voiceChannel: env.VOICE_CHANNEL_ID,
    });
  });
};
