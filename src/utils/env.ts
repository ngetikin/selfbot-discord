import { config } from 'dotenv';
import { z } from 'zod';
import type { AppEnv } from '../types/env';

// Load env from files. .env.local overrides .env.
config({ path: '.env' });
config({ path: '.env.local', override: true });

const envSchema = z.object({
  TOKEN: z.string().min(1, 'TOKEN is required'),
  VOICE_CHANNEL_ID: z.string().min(1, 'VOICE_CHANNEL_ID is required'),
  TARGET_GUILD_ID: z.string().min(1, 'TARGET_GUILD_ID is required'),
  ADMIN_ROLE_IDS: z.string().min(1, 'ADMIN_ROLE_IDS is required'),
  TTS_LANG: z.string().default('id-ID'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const loadEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
};
