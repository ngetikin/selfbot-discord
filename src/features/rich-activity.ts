import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { RichPresence } from 'discord.js-selfbot-v13';
import type { AppContext } from '../core/context';

type Button = { label: string; url: string };
type RichConfig = {
  applicationId: string;
  name?: string;
  details?: string;
  state?: string;
  type?: number;
  url?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  buttons?: Button[];
  customStatus?: { emoji?: string; text?: string };
};

const isHttpUrl = (value?: string) => !!value && /^https?:\/\//i.test(value);

export const applyRichActivity = async (ctx: AppContext): Promise<boolean> => {
  const file = join(process.cwd(), 'config', 'activity.json');
  if (!existsSync(file)) return false;

  let cfg: RichConfig;
  try {
    cfg = JSON.parse(readFileSync(file, 'utf8')) as RichConfig;
  } catch (err) {
    ctx.logger.warn('Failed to read activity.json', { err });
    return false;
  }

  try {
    const rp = new RichPresence(ctx.client)
      .setApplicationId(cfg.applicationId)
      .setType((cfg.type ?? 0) as unknown as RichPresence['type'])
      .setName(cfg.name ?? '')
      .setDetails(cfg.details ?? '')
      .setState(cfg.state ?? '');

    if (cfg.url) rp.setURL(cfg.url);
    if (cfg.largeImage) {
      if (isHttpUrl(cfg.largeImage)) {
        const [ext] = await RichPresence.getExternal(ctx.client, cfg.applicationId, cfg.largeImage);
        rp.setAssetsLargeImage(ext.external_asset_path);
      } else {
        rp.setAssetsLargeImage(cfg.largeImage);
      }
    }
    if (cfg.largeText) rp.setAssetsLargeText(cfg.largeText);
    if (cfg.smallImage) {
      if (isHttpUrl(cfg.smallImage)) {
        const [ext] = await RichPresence.getExternal(ctx.client, cfg.applicationId, cfg.smallImage);
        rp.setAssetsSmallImage(ext.external_asset_path);
      } else {
        rp.setAssetsSmallImage(cfg.smallImage);
      }
    }
    if (cfg.smallText) rp.setAssetsSmallText(cfg.smallText);
    if (cfg.buttons?.length) {
      for (const btn of cfg.buttons.slice(0, 2)) {
        rp.addButton(btn.label, btn.url);
      }
    }

    ctx.client.user?.setPresence({ activities: [rp] });
    ctx.logger.info('Rich presence applied from config/activity.json');
    return true;
  } catch (err) {
    ctx.logger.warn('Failed to apply rich presence', { err });
    return false;
  }
};
