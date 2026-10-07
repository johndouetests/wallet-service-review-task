import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: amqp.ChannelModel;
  private channel?: amqp.ConfirmChannel;
  private readonly exchange: string;

  constructor(private readonly config: ConfigService) {
    this.exchange = config.get<string>('rabbitmq.exchange', 'wallet.events');
  }

  async onModuleInit(): Promise<void> {
    this.connection = await amqp.connect(this.config.getOrThrow<string>('rabbitmq.url'));
    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    this.logger.log('Connected to RabbitMQ');
  }

  /** Resolves only after the broker confirms the message. */
  async publish(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel is not ready');
    const body = Buffer.from(JSON.stringify(payload));
    this.channel.publish(this.exchange, routingKey, body, { persistent: true, contentType: 'application/json' });
    await this.channel.waitForConfirms();
  }

  getChannel(): amqp.ConfirmChannel {
    if (!this.channel) throw new Error('RabbitMQ channel is not ready');
    return this.channel;
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
