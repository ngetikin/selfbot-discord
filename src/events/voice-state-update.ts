import type { VoiceState } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppEnv } from '../types/env';
export const voiceStateUpdateHandler = (client: AppClient, logger: Logger, env: AppEnv) => {
  client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const isTargetGuild = newState.guild.id === env.TARGET_GUILD_ID;
    if (!isTargetGuild) return;
    if (newState.id === client.user?.id) return;

    const joined = !oldState.channelId && newState.channelId;
    const left = oldState.channelId && !newState.channelId;
    if (!joined && !left) return;

    logger.debug('Voice state update', {
      channelId: newState.channelId,
      userId: newState.id,
      oldChannelId: oldState.channelId,
      joined,
      left,
    });
  });
};
