import type { Message } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
export const messageCreateHandler = (client: AppClient, logger: Logger) => {
  client.on('messageCreate', (message: Message) => {
    if (message.author.bot) return;
    if (message.author.id !== client.user?.id) return; // avoid responding to others until features are added
    logger.debug('Message received (self)', {
      content: message.content,
      channel: message.channel.id,
    });
  });
};
