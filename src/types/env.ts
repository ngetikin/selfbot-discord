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
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  ACTIVITY_MESSAGES?: string;
  RATE_MSGS_PER_MIN?: string;
  RATE_PRESENCE_MIN?: string;
  RATE_VOICE_JOIN_SEC?: string;
};
