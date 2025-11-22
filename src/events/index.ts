import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';
import { readyHandler } from './ready';
import { messageCreateHandler } from './message-create';
import { voiceStateUpdateHandler } from './voice-state-update';

export const registerEvents = (client: AppClient, logger: Logger, env: AppEnv) => {
  readyHandler(client, logger, env);
  messageCreateHandler(client, logger);
  voiceStateUpdateHandler(client, logger, env);
};
