import { Injectable } from '@nestjs/common';
import { RabbitMqService } from '../messaging/rabbitmq.service';

@Injectable()
export class AffiliateService {
  constructor(private rabbit: RabbitMqService) {}

  async sendFtd(accountId: string, amount: number, currency: string) {
    try {
      await this.rabbit.publish('affiliate.ftd', { accountId, amount, currency, ts: Date.now() });
    } catch (e) {}
  }
}
