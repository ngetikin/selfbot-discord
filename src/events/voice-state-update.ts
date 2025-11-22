import type { VoiceState } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';
import type { AppContext } from '../core/context';

export const voiceStateUpdateHandler = (
  client: AppClient,
  logger: Logger,
  env: AppEnv,
  ctx: AppContext,
) => {
  client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const isTargetGuild = newState.guild.id === env.TARGET_GUILD_ID;
    if (!isTargetGuild) return;
    if (newState.id === client.user?.id) return;

    const joined = !oldState.channelId && newState.channelId;
    const left = oldState.channelId && !newState.channelId;
    if (!joined && !left) return;

    const text = joined
      ? `${newState.member?.displayName ?? 'Seseorang'} bergabung`
      : `${oldState.member?.displayName ?? 'Seseorang'} keluar`;
    logger.debug('Voice state update', {
      channelId: newState.channelId,
      userId: newState.id,
      oldChannelId: oldState.channelId,
      joined,
      left,
    });
    ctx.voice.announce(text, env.VOICE_CHANNEL_ID, env.TTS_LANG);
  });
};
