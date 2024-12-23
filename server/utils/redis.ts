import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
});

export const redisUtil = {
  async set(key: string, value: string): Promise<void> {
    await redis.set(key, value);
  },

  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
};