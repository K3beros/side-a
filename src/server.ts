import 'dotenv/config';
import { buildApp } from './app.js';
import { config } from './config.js';

async function main(): Promise<void> {
  const app = buildApp();

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
