import type { Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const RATE_LIMIT_MS = 20_000;
const lastCallPerChannel = new Map<string, number>();

const isRateLimited = (channelId: string) => {
  const last = lastCallPerChannel.get(channelId) ?? 0;
  const now = Date.now();
  if (now - last < RATE_LIMIT_MS) return true;
  lastCallPerChannel.set(channelId, now);
  return false;
};

export const handleGroqChat = async (message: Message, ctx: AppContext) => {
  const { env, logger } = ctx;
  if (!env.GROQ_API_KEY) return;
  if (!message.mentions.has(ctx.client.user?.id ?? '')) return;

  const stripped = message.content.replace(/<@!?(\d+)>/g, '').trim();
  if (!stripped) return;
  if (stripped.toLowerCase().startsWith('say')) return; // handled by echo feature

  if (isRateLimited(message.channel.id)) {
    logger.debug('Groq chat skipped due to rate limit', { channel: message.channel.id });
    return;
  }

  const model = env.GROQ_MODEL || 'groq/compound';
  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: 'Balas singkat dalam Bahasa Indonesia. Jika diminta echo, jangan lakukan.',
      },
      { role: 'user', content: stripped },
    ],
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.warn('Groq API error', { status: res.status });
      return;
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return;
    await message.reply(reply);
    logger.debug('Groq reply sent');
  } catch (err) {
    logger.warn('Groq chat failed', { err });
  }
};
