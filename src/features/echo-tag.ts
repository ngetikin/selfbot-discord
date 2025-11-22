import type { Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

export const handleEchoTag = async (message: Message, ctx: AppContext) => {
  if (!message.mentions.has(ctx.client.user?.id ?? '')) return;
  const content = message.content.replace(/<@!?(\d+)>/g, '').trim();
  if (!content) return;

  try {
    await message.delete();
  } catch (err) {
    ctx.logger.warn('Failed to delete tagged message', { err });
  }

  try {
    await message.channel.send(content);
    ctx.logger.debug('Echo tag sent');
  } catch (err) {
    ctx.logger.warn('Failed to send echo tag', { err });
  }
};
