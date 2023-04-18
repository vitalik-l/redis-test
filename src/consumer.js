import Redis from 'ioredis';
import config from './config.js';
import fs from 'node:fs/promises';

const OUTPUT_FILE = './results.json';

const redis = new Redis();
const startTime = Date.now();

export const clearData = () => redis.flushall();

const saveResults = (numbersGenerated, startTime) => {
  const timeSpent = Date.now() - startTime;
  return fs.writeFile(OUTPUT_FILE, JSON.stringify({ timeSpent, numbersGenerated }, null, 2));
};

export const startConsumer = async () => {
  let lastId = 0;
  let valuesSet = new Set();
  while (valuesSet.size !== config.N) {
    const response = await redis.xread('COUNT', 1, 'STREAMS', 'numbers', lastId);
    if (response) {
      const data = response[0][1][0];
      const fieldNamesAndValues = data[1];
      const record = {
        id: data[0],
        timestamp: data[0].split('-')[0],
      };
      for (let i = 0; i < fieldNamesAndValues.length; i += 2) {
        record[fieldNamesAndValues[i]] = fieldNamesAndValues[i + 1];
      }
      lastId = record.id;
      if (!valuesSet.has(record.number)) {
        console.log('consume', record.number, 'length', valuesSet.size);
      }
      valuesSet.add(record.number);
    }
  }
  await saveResults([...valuesSet], startTime);
  process.exit(0);
};
