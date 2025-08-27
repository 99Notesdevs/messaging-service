import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redisPublisher = new Redis(REDIS_URL);
export const redisSubscriber = new Redis(REDIS_URL);

redisPublisher.on("error", (err) => console.error("Redis Pub Error", err));
redisSubscriber.on("error", (err) => console.error("Redis Sub Error", err));

export async function initRedis() {
  // ioredis connects automatically, but you can test connection here
  await redisPublisher.ping();
  await redisSubscriber.ping();
}
