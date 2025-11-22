import type { TextChannel } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const DEFAULT_MEME_API = 'https://candaan-api.vercel.app/api/receh/random';
const FALLBACK_MEME_API = 'https://meme-api.com/gimme';
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

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
  };
};

const parseMeme = (data: MemeResponse) => {
  const title = data?.message || data?.title || data?.data?.title || data?.data?.message || 'Meme';
  const url = data?.url || data?.image || data?.data?.url || data?.data?.image || '';
  const link = data?.postLink || data?.data?.postLink || '';
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
  const hours = [8, 13, 19, 18]; // WIB

  const sendMeme = async () => {
    try {
      if (!env.MEME_CHANNEL_ID) return;
      const channel = client.channels.cache.get(env.MEME_CHANNEL_ID) as TextChannel | undefined;
      if (!channel) {
        logger.warn('Meme channel not found', { channelId: env.MEME_CHANNEL_ID });
        return;
      }
      const meme = await fetchMeme(env.MEME_API_URL);
      await channel.send(`@everyone\n${meme.title}\n${meme.url}\n${meme.link ?? ''}`.trim());
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

  void sendMeme();
  if (env.MEME_DEBUG_NOW === 'true') {
    void sendMeme();
  }
  scheduleNext();
};
