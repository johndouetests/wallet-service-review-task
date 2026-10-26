import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AffiliateService } from './affiliate.service';
import { Bonus } from './bonus.entity';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(Bonus) private bonusRepo: Repository<Bonus>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private dataSource: DataSource,
    private affiliateService: AffiliateService,
  ) {}

  /**
   * Credits a 100% welcome bonus on the player's first deposit
   * and notifies the affiliate platform about the FTD.
   */
  async processFirstDeposit(accountId: string, amount: number, currency: string, depositTxId: string) {
    const account = await this.accountRepo.findOneBy({ id: accountId });
    if (!account || account.bonusOptOut) {
      return;
    }

    const existing = await this.bonusRepo.findOne({ where: { accountId, type: 'welcome' } });
    if (existing) {
      return;
    }

    let bonusAmount = amount * 1.0;
    if (bonusAmount > 500) {
      bonusAmount = 500;
    }
    console.log('bonus amount', bonusAmount);

    await this.dataSource.query(
      `UPDATE accounts SET balance_minor = balance_minor + ${Math.round(bonusAmount * 100)} WHERE id = '${accountId}'`,
    );

    await this.txRepo.insert({
      accountId,
      type: 'bonus' as any,
      amountMinor: String(bonusAmount * 100),
      currency,
      providerTxId: depositTxId,
      isBonus: true,
    });

    await this.bonusRepo.save({
      accountId,
      type: 'welcome',
      amount: bonusAmount,
      currency,
      depositTxId,
    });

    await this.affiliateService.sendFtd(accountId, amount, currency);
  }

  // private calcBonusOld(amount: number) {
  //   return amount * 0.5;
  // }
}
