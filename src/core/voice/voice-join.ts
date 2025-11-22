export const throttleJoin = (fn: (channelId: string) => Promise<void>, minIntervalMs: number) => {
  let last = 0;
  let pending: Promise<void> | null = null;

  return async (channelId: string) => {
    const now = Date.now();
    if (now - last < minIntervalMs && pending) {
      return pending;
    }
    last = now;
    pending = fn(channelId).catch((err) => {
      console.error('Join voice error', err);
    });
    return pending;
  };
};
