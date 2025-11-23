import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';
import type { AppContext } from '../core/context';
import { readyHandler } from './ready.js';
import { messageCreateHandler } from './message-create.js';
import { voiceStateUpdateHandler } from './voice-state-update.js';

export const registerEvents = (client: AppClient, logger: Logger, env: AppEnv, ctx: AppContext) => {
  readyHandler(client, logger, env, ctx);
  messageCreateHandler(client, logger, ctx);
  voiceStateUpdateHandler(client, logger, env);
};
