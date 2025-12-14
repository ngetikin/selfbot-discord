import type { TextChannel, GuildEmoji, EmojiResolvable, Message } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const DEFAULT_MEME_API = 'https://candaan-api.vercel.app/api/image/random';
const FALLBACK_MEME_API = 'https://meme-api.com/gimme';
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7
const SEND_ON_START_ENV = 'MEME_SEND_ON_START';
const MIN_REACTION = 5;
const MAX_REACTION = 20;

const defaultEmojis = ['😄', '😂', '😎', '🤔', '🔥', '👍', '🙌', '✨', '🚀', '🥳'];

type MemeResponse = {
  message?: string;
  title?: string;
  url?: string;
  image?: string;
  postLink?: string;
  data?: {
    title?: string;
    message?: string;
    url?: string;
    image?: string;
    postLink?: string;
    source?: string;
  };
};

const parseMeme = (data: MemeResponse) => {
  const payload = data?.data ?? {};
  const url = payload.url || data.url || payload.image || data.image || '';
  const title = payload.title || data.title || payload.source || data.postLink || 'Meme';
  const link = payload.source || data.postLink || '';
  return { title, url, link };
};

const fetchMeme = async (apiUrl?: string) => {
  const candidates = [apiUrl, DEFAULT_MEME_API, FALLBACK_MEME_API].filter(Boolean) as string[];
  let lastError: Error | null = null;

  for (const target of candidates) {
    try {
      const res = await fetch(target);
      if (!res.ok) throw new Error(`Failed to fetch meme: ${res.status}`);
      const data = (await res.json()) as MemeResponse;
      return parseMeme(data);
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError ?? new Error('No meme source available');
};

const pickRandom = <T>(arr: T[], count: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  while (copy.length && result.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

const reactWithRandomEmojis = async (message: Message, logger: AppContext['logger']) => {
  const guild = message.guild;
  const nonAnimated: EmojiResolvable[] = [];

  if (guild) {
    const custom = guild.emojis.cache.filter((e: GuildEmoji) => !e.animated);
    nonAnimated.push(...custom.map((e) => e.identifier));
  }

  if (nonAnimated.length === 0) nonAnimated.push(...defaultEmojis);

  const count = Math.floor(Math.random() * (MAX_REACTION - MIN_REACTION + 1)) + MIN_REACTION;
  const selection = pickRandom(nonAnimated, Math.min(count, nonAnimated.length));

  for (const emoji of selection) {
    try {
      await message.react(emoji);
    } catch (err) {
      logger.warn('Failed to react emoji on meme', { emoji, err });
    }
  }
};

const nextTriggerMs = (hoursWib: number[]): number => {
  const nowUtc = Date.now();
  const wibNow = new Date(nowUtc + WIB_OFFSET_MS);
  const sorted = [...hoursWib].sort((a, b) => a - b);

  for (const hour of sorted) {
    const candidateWib = new Date(wibNow);
    candidateWib.setHours(hour, 0, 0, 0);
    const candidateUtc = candidateWib.getTime() - WIB_OFFSET_MS;
    if (candidateUtc > nowUtc) return candidateUtc;
  }

  const nextDayWib = new Date(wibNow);
  nextDayWib.setDate(nextDayWib.getDate() + 1);
  nextDayWib.setHours(sorted[0], 0, 0, 0);
  return nextDayWib.getTime() - WIB_OFFSET_MS;
};

export const scheduleDailyMeme = (ctx: AppContext) => {
  const { env, logger, client } = ctx;
  if (!env.MEME_CHANNEL_ID) return;
  const hours = [8, 13, 19]; // WIB

  const sendMeme = async () => {
    try {
      if (!env.MEME_CHANNEL_ID) return;
      const channel = client.channels.cache.get(env.MEME_CHANNEL_ID) as TextChannel | undefined;
      if (!channel) {
        logger.warn('Meme channel not found', { channelId: env.MEME_CHANNEL_ID });
        return;
      }
      const meme = await fetchMeme(env.MEME_API_URL);
      if (meme.url) {
        const message = await channel.send({
          content: '@everyone',
          files: [meme.url],
        });
        await reactWithRandomEmojis(message, logger);
      } else {
        await channel.send(meme.title);
      }
      logger.info('Daily meme sent');
    } catch (err) {
      logger.warn('Daily meme failed', { err });
    }
  };

  const scheduleNext = () => {
    const nextUtc = nextTriggerMs(hours);
    const delay = Math.max(0, nextUtc - Date.now());
    setTimeout(async () => {
      await sendMeme();
      scheduleNext();
    }, delay);
  };

  if (env.MEME_DEBUG_NOW === 'true') {
    void sendMeme();
    return;
  }

  if (process.env[SEND_ON_START_ENV] === 'true') {
    void sendMeme();
  }

  scheduleNext();
};
