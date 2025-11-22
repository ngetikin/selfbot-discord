import type { Message } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';

// Voice reader disabled: only log self messages for now.
export const messageCreateHandler = (client: AppClient, logger: Logger) => {
  client.on('messageCreate', (message: Message) => {
    if (message.author.bot) return;
    if (message.author.id !== client.user?.id) return;
    logger.debug('Message observed (self)', {
      content: message.content,
      channel: message.channel.id,
    });
  });
};
