import type { TextChannel } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

const MEME_URL = 'https://meme-api.com/gimme';

const fetchMeme = async () => {
  const res = await fetch(MEME_URL);
  if (!res.ok) throw new Error(`Failed to fetch meme: ${res.status}`);
  const data = (await res.json()) as { url?: string; title?: string; postLink?: string };
  if (!data.url) throw new Error('No meme url');
  return data;
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
      const meme = await fetchMeme();
      await channel.send(`${meme.title ?? 'Meme'}\n${meme.url}\n${meme.postLink ?? ''}`.trim());
      logger.info('Daily meme sent');
    } catch (err) {
      logger.warn('Daily meme failed', { err });
    }
  };
  // Send on ready and every 6h
  void sendMeme();
  setInterval(sendMeme, 6 * 60 * 60 * 1000);
};
