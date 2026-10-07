import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxRelay implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly rabbit: RabbitMqService,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap(): void {
    const interval = this.config.get<number>('outbox.pollIntervalMs', 1000);
    this.timer = setInterval(() => void this.tick(), interval);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.publishBatch();
    } catch (err) {
      this.logger.error(`Outbox publish failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private async publishBatch(): Promise<void> {
    const batchSize = this.config.get<number>('outbox.batchSize', 100);
    await this.dataSource.transaction(async (manager) => {
      // SKIP LOCKED lets several replicas run the relay without publishing the same event twice
      const events = await manager
        .createQueryBuilder(OutboxEvent, 'e')
        .where('e.published_at IS NULL')
        .orderBy('e.id', 'ASC')
        .limit(batchSize)
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .getMany();

      for (const event of events) {
        await this.rabbit.publish(event.routingKey, { eventId: event.id, ...event.payload });
        await manager.update(OutboxEvent, { id: event.id }, { publishedAt: new Date() });
      }
    });
  }
}
