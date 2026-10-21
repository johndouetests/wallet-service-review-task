import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AffiliateService } from './affiliate.service';
import { Bonus } from './bonus.entity';
import { BonusService } from './bonus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bonus, Transaction, Account])],
  providers: [BonusService, AffiliateService],
  exports: [BonusService],
})
export class BonusModule {}
