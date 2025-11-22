import type { Message, GuildEmoji, EmojiResolvable } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const pickRandom = <T>(arr: T[], count: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  while (copy.length && result.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

const defaultEmojis = ['😄', '😂', '😎', '🤔', '🔥', '👍', '🙌', '✨', '🚀', '🥳'];

export const handleAutoEmoji = async (message: Message, ctx: AppContext) => {
  const { env, logger } = ctx;
  if (!env.EMOJI_CHANNEL_IDS) return;
  const channels = env.EMOJI_CHANNEL_IDS.split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  if (!channels.includes(message.channel.id)) return;
  if (message.author.bot) return;

  const guild = message.guild;
  const nonAnimated: EmojiResolvable[] = [];
  if (guild) {
    const custom = guild.emojis.cache.filter((e: GuildEmoji) => !e.animated);
    nonAnimated.push(...custom.map((e) => e.identifier));
  }
  if (nonAnimated.length === 0) nonAnimated.push(...defaultEmojis);

  const count = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
  const selection = pickRandom(nonAnimated, Math.min(count, nonAnimated.length));

  for (const emoji of selection) {
    try {
      await message.react(emoji);
    } catch (err) {
      logger.warn('Failed to react emoji', { emoji, err });
    }
  }
};
