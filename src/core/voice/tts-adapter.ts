import { spawn } from 'child_process';
import type { AppEnv } from '../../types/env';
import type { Logger } from '../../utils/logger';
import type { TtsDriver, VoiceQueueItem } from '../../types/voice';

export const createVoiceAdapter = (_env: AppEnv, logger: Logger): TtsDriver => {
  const speak = async (item: VoiceQueueItem) =>
    new Promise<void>((resolve, reject) => {
      const args = ['-v', item.lang, item.text];
      const proc = spawn('espeak-ng', args, { stdio: 'ignore' });
      const timeout = setTimeout(() => {
        proc.kill('SIGKILL');
        reject(new Error('espeak-ng timeout'));
      }, 10_000);

      proc.on('error', (err) => {
        clearTimeout(timeout);
        logger.error('espeak-ng error', { err });
        reject(err);
      });
      proc.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`espeak-ng exited with code ${code}`));
        }
      });
    });

  return { speak };
};
