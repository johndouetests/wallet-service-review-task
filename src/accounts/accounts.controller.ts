import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AccountsService, BalanceView } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get(':id/balance')
  getBalance(@Param('id', new ParseUUIDPipe()) id: string): Promise<BalanceView> {
    return this.accounts.getBalance(id);
  }
}
