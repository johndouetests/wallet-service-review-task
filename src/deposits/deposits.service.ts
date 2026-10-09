import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { BalanceCache } from '../accounts/balance-cache';
import { addMinor } from '../common/money';
import { OutboxService } from '../outbox/outbox.service';
import { Transaction } from '../transactions/transaction.entity';
import { DepositWebhookDto } from './dto/deposit-webhook.dto';

export type DepositResult = 'credited' | 'duplicate' | 'ignored';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly outbox: OutboxService,
    private readonly cache: BalanceCache,
  ) {}

  async handleWebhook(dto: DepositWebhookDto): Promise<DepositResult> {
    if (dto.status !== 'success') {
      this.logger.log(`Deposit ${dto.providerTxId} status=${dto.status}, nothing to credit`);
      return 'ignored';
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        // Lock the account row so concurrent credits to the same account are serialised
        const account = await manager.findOne(Account, {
          where: { id: dto.accountId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!account) {
          throw new Error(`Account ${dto.accountId} not found`);
        }
        if (account.currency !== dto.currency) {
          throw new Error(`Currency mismatch for account ${account.id}`);
        }

        // The unique index on provider_tx_id makes PSP retries idempotent
        await manager.insert(Transaction, {
          accountId: account.id,
          type: 'deposit',
          amountMinor: dto.amountMinor,
          currency: dto.currency,
          providerTxId: dto.providerTxId,
        });

        await manager.update(Account, { id: account.id }, { balanceMinor: addMinor(account.balanceMinor, dto.amountMinor) });

        await this.outbox.enqueue(manager, 'deposit.completed', {
          accountId: account.id,
          providerTxId: dto.providerTxId,
          amountMinor: dto.amountMinor,
          currency: dto.currency,
        });
      });
    } catch (err) {
      if (err instanceof QueryFailedError && (err as QueryFailedError & { code?: string }).code === UNIQUE_VIOLATION) {
        this.logger.log(`Deposit ${dto.providerTxId} already processed`);
        return 'duplicate';
      }
      throw err;
    }

    await this.cache.invalidate(dto.accountId);
    this.logger.log(`Deposit ${dto.providerTxId} credited to ${dto.accountId}`);
    return 'credited';
  }
}
