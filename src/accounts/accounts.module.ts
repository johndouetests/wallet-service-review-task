import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { BalanceCache } from './balance-cache';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountsController],
  providers: [AccountsService, BalanceCache],
  exports: [AccountsService, BalanceCache, TypeOrmModule],
})
export class AccountsModule {}
