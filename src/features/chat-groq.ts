import type { Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const RATE_LIMIT_MS = 20_000;
const lastCallPerChannel = new Map<string, number>();
const MAX_INPUT_CHARS = 500;
const MODEL_CANDIDATES = [
  'llama-3.3-8b-instant',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

const isRateLimited = (channelId: string) => {
  const last = lastCallPerChannel.get(channelId) ?? 0;
  const now = Date.now();
  if (now - last < RATE_LIMIT_MS) return true;
  lastCallPerChannel.set(channelId, now);
  return false;
};

export const handleGroqChat = async (message: Message, ctx: AppContext) => {
  const { env, logger, client } = ctx;
  if (!env.GROQ_API_KEY) return;
  if (message.author.id === client.user?.id) return;
  if (!message.mentions.has(client.user?.id ?? '')) return;

  const stripped = message.content.replace(/<@!?(\d+)>/g, '').trim();
  if (!stripped) return;
  if (stripped.toLowerCase().startsWith('say')) return; // handled by echo feature

  if (isRateLimited(message.channel.id)) {
    logger.debug('Groq chat skipped due to rate limit', { channel: message.channel.id });
    return;
  }

  const model = env.GROQ_MODEL || MODEL_CANDIDATES[0];
  const userContent = stripped.slice(0, MAX_INPUT_CHARS);

  const buildPayload = (m: string) => ({
    model: m,
    max_tokens: 64,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: 'Balas singkat dalam Bahasa Indonesia.',
      },
      { role: 'user', content: userContent },
    ],
  });

  const callGroq = async (m: string) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(buildPayload(m)),
    });
    return res;
  };

  try {
    const modelsToTry = [model, ...MODEL_CANDIDATES.filter((m) => m !== model)];
    for (const m of modelsToTry) {
      const res = await callGroq(m);
      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) await message.reply(reply);
        logger.debug('Groq reply sent', { model: m });
        return;
      }
      logger.warn('Groq API error', { status: res.status, model: m });
      if (res.status === 413) {
        await message.reply('Maaf, pesannya terlalu panjang.');
        return;
      }
      if (res.status === 404) continue; // try next model
    }
  } catch (err) {
    logger.warn('Groq chat failed', { err });
  }
};
