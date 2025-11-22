import type { GuildMember, Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const hasAdminRole = (member: GuildMember | null, adminRoles: string[]): boolean => {
  if (!member) return false;
  return member.roles.cache.some((role) => adminRoles.includes(role.id));
};

export const handleEchoTag = async (message: Message, ctx: AppContext) => {
  const member = message.member ?? null;
  const adminRoles = ctx.env.ADMIN_ROLE_IDS.split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  if (!hasAdminRole(member, adminRoles)) return;

  if (!message.mentions.has(ctx.client.user?.id ?? '')) return;

  const stripped = message.content.replace(/<@!?(\d+)>/g, '').trim();
  if (!stripped.toLowerCase().startsWith('say')) return;

  const content = stripped.replace(/^say/i, '').trim();
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
