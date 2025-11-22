export type AppEnv = {
  TOKEN: string;
  VOICE_CHANNEL_ID: string;
  TARGET_GUILD_ID: string;
  ADMIN_ROLE_IDS: string;
  TTS_LANG: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  EMOJI_CHANNEL_IDS?: string;
  MEME_CHANNEL_ID?: string;
  MEME_API_URL?: string;
  MEME_DEBUG_NOW?: string;
  ACTIVITY_MESSAGES?: string;
};
