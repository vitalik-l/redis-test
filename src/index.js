import { fork } from 'node:child_process';
import config from './config.js';
import { startConsumer, clearData } from './consumer.js';

async function main() {
  await clearData();
  for (let i = 0; i < config.PRODUCERS; i++) {
    fork('./src/producer');
  }
  await startConsumer();
}

main().catch(console.error);
