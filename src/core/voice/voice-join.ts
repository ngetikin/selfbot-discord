export const throttleJoin = <T>(fn: (channelId: string) => Promise<T>, minIntervalMs: number) => {
  let last = 0;
  let pending: Promise<T> | null = null;

  return async (channelId: string) => {
    const now = Date.now();
    if (now - last < minIntervalMs && pending) {
      return pending;
    }
    last = now;
    pending = fn(channelId).catch((err) => {
      console.error('Join voice error', err);
      throw err;
    });
    return pending;
  };
};
