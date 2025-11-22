import { createClient } from './core/client';
import { createVoiceService } from './core/voice';
import { FileStorage } from './core/storage';
import { Scheduler } from './core/scheduler';
import { loadEnv } from './utils/env';
import { createLogger } from './utils/logger';
import { registerEvents } from './events';

const main = async () => {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);

  const storage = new FileStorage('data');
  const scheduler = new Scheduler();
  const voice = createVoiceService(env, logger);

  const client = createClient(logger);
  registerEvents(client, logger, env);

  voice.init();
  logger.debug('Scheduler initialized', { tasks: scheduler.popReady(Date.now()).length });
  logger.debug('Storage initialized', { baseDir: 'data', example: storage.readJson('init', {}) });

  await client.login(env.TOKEN);
};

main().catch((error) => {
  console.error('Fatal error during startup', error);
  process.exit(1);
});
