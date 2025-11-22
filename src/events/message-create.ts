import type { Message } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppContext } from '../core/context';

export const messageCreateHandler = (client: AppClient, logger: Logger, ctx: AppContext) => {
  client.on('messageCreate', (message: Message) => {
    if (message.author.bot) return;
    const textChannelId = ctx.env.VOICE_TEXT_CHANNEL_ID || ctx.env.VOICE_CHANNEL_ID;
    if (message.channel.id !== textChannelId) return;
    if (message.content.length === 0 || message.content.length > 200) return;

    logger.debug('Voice reader enqueue', { content: message.content, channel: message.channel.id });
    ctx.voice.enqueue({
      text: message.content,
      lang: ctx.env.TTS_LANG,
      channelId: ctx.env.VOICE_CHANNEL_ID,
      userId: message.author.id,
    });
  });
};
