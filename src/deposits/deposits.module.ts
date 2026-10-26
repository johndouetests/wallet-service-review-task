import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { BonusModule } from '../bonus/bonus.module';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { WebhookSignatureGuard } from './webhook-signature.guard';

@Module({
  imports: [AccountsModule, BonusModule],
  controllers: [DepositsController],
  providers: [DepositsService, WebhookSignatureGuard],
})
export class DepositsModule {}
