import type { TextChannel } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const DEFAULT_MEME_API = 'https://candaan-api.vercel.app/api/receh/random';

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
  const target = apiUrl || DEFAULT_MEME_API;
  const res = await fetch(target);
  if (!res.ok) throw new Error(`Failed to fetch meme: ${res.status}`);
  const data = (await res.json()) as MemeResponse;
  return parseMeme(data);
};

export const scheduleDailyMeme = (ctx: AppContext) => {
  const { env, logger, client } = ctx;
  if (!env.MEME_CHANNEL_ID) return;
  const sendMeme = async () => {
    try {
      if (!env.MEME_CHANNEL_ID) return;
      const channel = client.channels.cache.get(env.MEME_CHANNEL_ID) as TextChannel | undefined;
      if (!channel) {
        logger.warn('Meme channel not found', { channelId: env.MEME_CHANNEL_ID });
        return;
      }
      const meme = await fetchMeme(env.MEME_API_URL);
      await channel.send(`${meme.title}\n${meme.url}\n${meme.link ?? ''}`.trim());
      logger.info('Daily meme sent');
    } catch (err) {
      logger.warn('Daily meme failed', { err });
    }
  };
  // Send on ready and every 6h
  void sendMeme();
  setInterval(sendMeme, 6 * 60 * 60 * 1000);
};
