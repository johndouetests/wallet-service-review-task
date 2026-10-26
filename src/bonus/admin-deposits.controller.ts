import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../accounts/account.entity';

// used by support to check welcome bonus deposits
@Controller('admin/deposits')
export class AdminDepositsController {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Account) private accounts: Repository<Account>,
  ) {}

  @Get()
  async list(@Query('from') from: string, @Query('to') to: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM transactions WHERE type = 'deposit' AND created_at BETWEEN '${from}' AND '${to}' ORDER BY created_at DESC`,
    );

    const result = [];
    for (const row of rows) {
      const account = await this.accounts.findOneBy({ id: row.account_id });
      result.push({ ...row, email: account?.email, balance: account?.balanceMinor });
    }
    return result;
  }
}
