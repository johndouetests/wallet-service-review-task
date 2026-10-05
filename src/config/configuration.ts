export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    balanceTtlSeconds: parseInt(process.env.BALANCE_CACHE_TTL_SECONDS ?? '30', 10),
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: 'wallet.events',
  },
  psp: {
    webhookSecret: process.env.PSP_WEBHOOK_SECRET,
  },
  outbox: {
    pollIntervalMs: parseInt(process.env.OUTBOX_POLL_INTERVAL_MS ?? '1000', 10),
    batchSize: 100,
  },
});
