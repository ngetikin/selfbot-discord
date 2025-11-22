export type AppEnv = {
  TOKEN: string;
  VOICE_CHANNEL_ID: string;
  VOICE_TEXT_CHANNEL_ID?: string;
  TARGET_GUILD_ID: string;
  ADMIN_ROLE_IDS: string;
  TTS_LANG: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
};
