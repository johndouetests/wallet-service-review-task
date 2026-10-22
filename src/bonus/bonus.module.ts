import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AdminDepositsController } from './admin-deposits.controller';
import { AffiliateService } from './affiliate.service';
import { Bonus } from './bonus.entity';
import { BonusService } from './bonus.service';
import { FtdConsumer } from './ftd.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Bonus, Transaction, Account])],
  controllers: [AdminDepositsController],
  providers: [BonusService, AffiliateService, FtdConsumer],
  exports: [BonusService],
})
export class BonusModule {}
