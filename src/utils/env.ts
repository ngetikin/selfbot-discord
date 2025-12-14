import { config } from 'dotenv';
import { z } from 'zod';
import type { AppEnv } from '../types/env';

const MAX_ACTIVITY_ENTRIES = 20;

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
  EMOJI_CHANNEL_IDS: z.string().optional(),
  MEME_CHANNEL_ID: z.string().optional(),
  MEME_API_URL: z.string().url().optional(),
  MEME_DEBUG_NOW: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  ACTIVITY_MESSAGES: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const entries = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return entries.length <= MAX_ACTIVITY_ENTRIES;
    }, `ACTIVITY_MESSAGES supports up to ${MAX_ACTIVITY_ENTRIES} entries`),
  RATE_MSGS_PER_MIN: z.string().default('5'),
  RATE_PRESENCE_MIN: z.string().default('5'),
  RATE_VOICE_JOIN_SEC: z.string().default('30'),
});

export const loadEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
};
