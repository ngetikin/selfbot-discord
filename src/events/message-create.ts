import type { Message } from 'discord.js-selfbot-v13';
import type { AppClient } from '../core/client';
import type { Logger } from '../utils/logger';
import type { AppContext } from '../core/context';
import { handleAutoEmoji } from '../features/auto-emoji.js';
import { handleEchoTag } from '../features/echo-tag.js';
import { handleGroqChat } from '../features/chat-groq.js';

// Voice reader disabled: only log self messages; auto-emoji for target channels.
export const messageCreateHandler = (client: AppClient, logger: Logger, ctx: AppContext) => {
  client.on('messageCreate', (message: Message) => {
    void handleAutoEmoji(message, ctx);
    void handleEchoTag(message, ctx);
    void handleGroqChat(message, ctx);
    if (message.author.bot) return;
    if (message.author.id !== client.user?.id) return;
    logger.debug('Message observed (self)', {
      content: message.content,
      channel: message.channel.id,
    });
  });
};
