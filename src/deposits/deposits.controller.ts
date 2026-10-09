import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { DepositResult, DepositsService } from './deposits.service';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';
import { WebhookSignatureGuard } from './webhook-signature.guard';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly deposits: DepositsService) {}

  /** PSP callback. Always 200 for processed and duplicate deliveries so the PSP stops retrying. */
  @Post('webhook')
  @HttpCode(200)
  @UseGuards(WebhookSignatureGuard)
  async webhook(@Body() dto: DepositWebhookDto): Promise<{ result: DepositResult }> {
    const result = await this.deposits.handleWebhook(dto);
    return { result };
  }
}
