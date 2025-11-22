import type { Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

type ReplyRule = {
  pattern: RegExp;
  responses: string[];
};

const defaultRules: ReplyRule[] = [
  { pattern: /halo|hai|hello/i, responses: ['Halo!', 'Hai juga!', 'Hallo 👋'] },
  { pattern: /bot/i, responses: ['Ya?', 'Ada apa?', 'Hmm?'] },
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const handleAutoReply = async (message: Message, ctx: AppContext) => {
  const rules = defaultRules;
  const content = message.content || '';
  for (const rule of rules) {
    if (rule.pattern.test(content)) {
      const reply = pick(rule.responses);
      try {
        await message.reply(reply);
        ctx.logger.debug('AutoReply sent', { rule: rule.pattern.toString() });
      } catch (err) {
        ctx.logger.warn('AutoReply failed', { err });
      }
      break;
    }
  }
};
