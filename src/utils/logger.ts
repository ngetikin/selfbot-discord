type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type Logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

const redact = (meta?: Record<string, unknown>) => {
  if (!meta) return meta;
  const clone: Record<string, unknown> = { ...meta };
  for (const key of Object.keys(clone)) {
    if (typeof clone[key] === 'string' && key.toLowerCase().includes('token')) {
      clone[key] = '[REDACTED]';
    }
  }
  return clone;
};

export const createLogger = (level: LogLevel = 'info'): Logger => {
  const threshold = levelPriority[level] ?? levelPriority.info;
  const log = (lvl: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (levelPriority[lvl] < threshold) return;
    const payload = meta ? { ...redact(meta) } : undefined;
    console[lvl === 'debug' ? 'log' : lvl](`[${lvl.toUpperCase()}] ${msg}`, payload ?? '');
  };

  return {
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
  };
};
