import type { AppClient } from './client';
import type { Scheduler } from './scheduler';
import type { FileStorage } from './storage';
import type { VoiceService } from './voice';
import type { AppEnv } from '../types/env';
import type { Logger } from '../utils/logger';

export type AppContext = {
  client: AppClient;
  scheduler: Scheduler;
  storage: FileStorage;
  voice: VoiceService;
  env: AppEnv;
  logger: Logger;
};
