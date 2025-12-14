import { createClient } from './core/client.js';
import { createVoiceService } from './core/voice/index.js';
import { FileStorage } from './core/storage.js';
import { Scheduler } from './core/scheduler.js';
import { loadEnv } from './utils/env.js';
import { createLogger } from './utils/logger.js';
import { registerEvents } from './events/index.js';
import type { AppContext } from './core/context';
import { restoreScheduler, startSchedulerPersistence } from './core/scheduler-persist.js';

const handleShutdown = (ctx: AppContext, persist?: { saveNow: () => void; stop: () => void }) => {
  const { logger, scheduler, voice, client } = ctx;
  return async () => {
    logger.info('Shutting down...');
    persist?.saveNow();
    persist?.stop();
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

  restoreScheduler(scheduler, storage);
  const schedulerPersist = startSchedulerPersistence(scheduler, storage);

  const ctx: AppContext = {
    client,
    scheduler,
    storage,
    voice,
    env,
    logger,
  };

  registerEvents(client, logger, env, ctx);

  const shutdown = handleShutdown(ctx, schedulerPersist);
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
