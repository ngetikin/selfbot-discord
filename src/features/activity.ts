import type { AppContext } from '../core/context';
import type { ActivityOptions } from 'discord.js-selfbot-v13';

const parseActivities = (raw?: string): ActivityOptions[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, type: 'PLAYING' as const }));
};

export const startActivityRotation = (ctx: AppContext) => {
  const activities = parseActivities(ctx.env.ACTIVITY_MESSAGES);
  if (activities.length === 0) return;
  let idx = 0;

  const rotate = () => {
    const activity = activities[idx % activities.length];
    idx += 1;
    ctx.client.user?.setActivity(activity);
    ctx.logger.debug('Activity set', { activity: activity.name });
  };

  rotate();
  setInterval(rotate, 5 * 60 * 1000);
};
