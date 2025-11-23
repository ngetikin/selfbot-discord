import { spawn } from 'child_process';
import type { AppEnv } from '../../types/env';
import type { Logger } from '../../utils/logger';
import type { TtsDriver, VoiceQueueItem } from '../../types/voice';
import type { VoiceConnection } from 'discord.js-selfbot-v13';

export const createVoiceAdapter = (_env: AppEnv, logger: Logger): TtsDriver => {
  const speak = async (item: VoiceQueueItem, connection: VoiceConnection) =>
    new Promise<void>((resolve, reject) => {
      const args = ['-v', item.lang, '--stdout', item.text];
      const proc = spawn('espeak-ng', args, { stdio: ['ignore', 'pipe', 'ignore'] });

      const timeout = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error('espeak-ng timeout'));
      }, 10_000);

      proc.on('error', (err) => {
        clearTimeout(timeout);
        logger.error('espeak-ng error', { err });
        reject(err);
      });

      const dispatcher = connection.playAudio(proc.stdout, { type: 'converted' });
      dispatcher.once('finish', () => {
        clearTimeout(timeout);
        resolve();
      });
      dispatcher.once('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
      proc.on('close', (code) => {
        if (code !== 0) {
          logger.warn?.('espeak-ng exited with non-zero code', { code });
        }
      });
    });

  return { speak };
};
