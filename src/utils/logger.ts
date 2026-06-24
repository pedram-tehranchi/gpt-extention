type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PREFIX = '[GPT Extension]';

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry = context ? `${message} ${JSON.stringify(context)}` : message;

  switch (level) {
    case 'debug':
      console.debug(LOG_PREFIX, entry);
      break;
    case 'info':
      console.info(LOG_PREFIX, entry);
      break;
    case 'warn':
      console.warn(LOG_PREFIX, entry);
      break;
    case 'error':
      console.error(LOG_PREFIX, entry);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};
