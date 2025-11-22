import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';
import type { AppContext } from '../core/context';

export const readyHandler = (client: AppClient, logger: Logger, env: AppEnv, ctx: AppContext) => {
  client.once('ready', () => {
    logger.info('Ready event received', {
      user: client.user?.tag,
      guild: env.TARGET_GUILD_ID,
      voiceChannel: env.VOICE_CHANNEL_ID,
    });
    logger.debug('Context ready', {
      schedulerTasks: ctx.scheduler.snapshot().length,
      storageKeys: ctx.storage.listKeys(),
    });
    void ctx.voice.join(env.VOICE_CHANNEL_ID);
  });
};
