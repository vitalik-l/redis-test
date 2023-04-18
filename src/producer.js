import Redis from 'ioredis';
import config from './config.js';

const redis = new Redis();

const generateNumber = (max) => {
  return Math.floor(Math.random() * (max + 1));
};

const startProducer = async () => {
  const number = generateNumber(config.N);
  await redis.xadd(config.STREAM_KEY, '*', 'number', number);
  setTimeout(startProducer, 1000);
};

startProducer().catch(console.error);
