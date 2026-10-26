import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMqService } from '../messaging/rabbitmq.service';

const QUEUE = 'affiliate.ftd';

@Injectable()
export class FtdConsumer implements OnModuleInit {
  private readonly logger = new Logger(FtdConsumer.name);

  constructor(private rabbit: RabbitMqService, private config: ConfigService) {}

  async onModuleInit() {
    const channel = this.rabbit.getChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, 'wallet.events', 'affiliate.ftd');

    await channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      channel.ack(msg);

      try {
        const event = JSON.parse(msg.content.toString());
        await fetch(this.config.get('affiliate.url')!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.config.get('affiliate.apiKey')!,
          },
          body: JSON.stringify({
            event: 'ftd',
            player_id: event.accountId,
            amount: event.amount,
            currency: event.currency,
          }),
        });
      } catch (err) {
        this.logger.warn('ftd send failed');
      }
    });
  }
}
