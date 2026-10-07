import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OutboxEvent } from './outbox-event.entity';

/**
 * Events are written to the outbox inside the same DB transaction as the
 * business change, and published to RabbitMQ later by OutboxRelay.
 * Never publish to the broker directly from a request handler.
 */
@Injectable()
export class OutboxService {
  async enqueue(manager: EntityManager, routingKey: string, payload: Record<string, unknown>): Promise<void> {
    await manager.save(manager.create(OutboxEvent, { routingKey, payload }));
  }
}
