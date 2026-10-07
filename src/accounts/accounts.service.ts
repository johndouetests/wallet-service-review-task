import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { BalanceCache } from './balance-cache';

export interface BalanceView {
  accountId: string;
  currency: string;
  balanceMinor: string;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly cache: BalanceCache,
  ) {}

  async getBalance(accountId: string): Promise<BalanceView> {
    const account = await this.findOrFail(accountId);
    const cached = await this.getCached(accountId);
    if (cached !== null) {
      return { accountId, currency: account.currency, balanceMinor: cached };
    }
    await this.cache.set(accountId, account.balanceMinor);
    return { accountId, currency: account.currency, balanceMinor: account.balanceMinor };
  }

  private getCached(accountId: string): Promise<string | null> {
    return this.cache.get(accountId);
  }

  private async findOrFail(accountId: string): Promise<Account> {
    const account = await this.accounts.findOneBy({ id: accountId });
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
    return account;
  }
}
