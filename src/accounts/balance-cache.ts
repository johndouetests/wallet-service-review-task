import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class BalanceCache implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;

  constructor(config: ConfigService) {
    this.redis = new Redis(config.getOrThrow<string>('redis.url'), { lazyConnect: true });
    this.ttlSeconds = config.get<number>('redis.balanceTtlSeconds', 30);
  }

  private key(accountId: string): string {
    return `balance:${accountId}`;
  }

  get(accountId: string): Promise<string | null> {
    return this.redis.get(this.key(accountId));
  }

  async set(accountId: string, balanceMinor: string): Promise<void> {
    await this.redis.set(this.key(accountId), balanceMinor, 'EX', this.ttlSeconds);
  }

  async invalidate(accountId: string): Promise<void> {
    await this.redis.del(this.key(accountId));
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
