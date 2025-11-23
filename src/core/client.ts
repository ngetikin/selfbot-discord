import type { ClientEvents } from 'discord.js-selfbot-v13';
import { Client } from 'discord.js-selfbot-v13';
import type { Logger } from '../utils/logger';

export type AppClient = Client;

export const createClient = (logger: Logger): AppClient => {
  const client = new Client();

  client.once('ready', () => {
    logger.info('Client ready');
  });

  client.on('error', (err) => {
    logger.error('Client error', { err });
  });

  client.on('shardError', (err) => {
    logger.error('Shard error', { err });
  });

  return client;
};

export const on = <K extends keyof ClientEvents>(
  client: AppClient,
  event: K,
  listener: (...args: ClientEvents[K]) => void,
): void => {
  client.on(event, listener);
};
