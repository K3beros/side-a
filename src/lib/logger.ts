export function loggerOptions(isDev: boolean) {
  if (isDev) {
    return {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
    };
  }
  return { level: process.env.LOG_LEVEL ?? 'info' };
}
