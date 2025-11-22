import { createClient } from './core/client';
import { createVoiceService } from './core/voice';
import { FileStorage } from './core/storage';
import { Scheduler } from './core/scheduler';
import { loadEnv } from './utils/env';
import { createLogger } from './utils/logger';
import { registerEvents } from './events';
import type { AppContext } from './core/context';

const handleShutdown = (ctx: AppContext) => {
  const { logger, scheduler, voice, client } = ctx;
  return async () => {
    logger.info('Shutting down...');
    scheduler.shutdown();
    try {
      await voice.leave();
    } catch (err) {
      logger.error('Error leaving voice on shutdown', { err });
    }
    try {
      client.destroy();
    } catch (err) {
      logger.error('Error destroying client on shutdown', { err });
    }
    // storage is file-based; nothing async to flush here
    process.exit(0);
  };
};

const main = async () => {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);

  const scheduler = new Scheduler();
  const client = createClient(logger);
  const voice = createVoiceService({ client, env, logger });
  const storage = new FileStorage('data');

  const ctx: AppContext = {
    client,
    scheduler,
    storage,
    voice,
    env,
    logger,
  };

  registerEvents(client, logger, env, ctx);

  const shutdown = handleShutdown(ctx);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  voice.init();
  logger.debug('Scheduler initialized', { tasks: scheduler.snapshot().length });
  logger.debug('Storage initialized', { baseDir: 'data', keys: storage.listKeys() });

  await client.login(env.TOKEN);
};

main().catch((error) => {
  console.error('Fatal error during startup', error);
  process.exit(1);
});
