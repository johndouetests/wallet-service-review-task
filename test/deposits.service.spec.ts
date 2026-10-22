import { QueryFailedError } from 'typeorm';
import { DepositsService } from '../src/deposits/deposits.service';
import { DepositWebhookDto } from '../src/deposits/dto/deposit-webhook.dto';

const ACCOUNT_ID = '5b0c6a2e-8f6d-4a51-9a52-3f1d2b7c9e10';

function dto(overrides: Partial<DepositWebhookDto> = {}): DepositWebhookDto {
  return {
    providerTxId: 'tx-1',
    accountId: ACCOUNT_ID,
    amount: 25,
    currency: 'EUR',
    status: 'success',
    ...overrides,
  };
}

function setup(options: { insertError?: Error } = {}) {
  const manager = {
    findOne: jest.fn().mockResolvedValue({ id: ACCOUNT_ID, currency: 'EUR', balanceMinor: '1000' }),
    insert: options.insertError ? jest.fn().mockRejectedValue(options.insertError) : jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const dataSource = { transaction: jest.fn((fn: (m: typeof manager) => Promise<void>) => fn(manager)) };
  const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
  const cache = { invalidate: jest.fn().mockResolvedValue(undefined) };
  const bonus = { processFirstDeposit: jest.fn().mockResolvedValue(undefined) };
  const service = new DepositsService(dataSource as any, outbox as any, cache as any, bonus as any);
  return { service, manager, outbox, cache };
}

describe('DepositsService', () => {
  it('credits a successful deposit and enqueues an event in the same transaction', async () => {
    const { service, manager, outbox, cache } = setup();

    await expect(service.handleWebhook(dto())).resolves.toBe('credited');

    expect(manager.update).toHaveBeenCalledWith(expect.anything(), { id: ACCOUNT_ID }, { balanceMinor: '3500' });
    expect(outbox.enqueue).toHaveBeenCalledWith(manager, 'deposit.completed', expect.objectContaining({ amountMinor: '2500' }));
    expect(cache.invalidate).toHaveBeenCalledWith(ACCOUNT_ID);
  });

  it('ignores non-success statuses', async () => {
    const { service, manager } = setup();

    await expect(service.handleWebhook(dto({ status: 'pending' }))).resolves.toBe('ignored');
    expect(manager.insert).not.toHaveBeenCalled();
  });

  it('treats a repeated providerTxId as a duplicate', async () => {
    const error = Object.assign(new QueryFailedError('INSERT', [], new Error('duplicate key')), { code: '23505' });
    const { service, manager, cache } = setup({ insertError: error });

    await expect(service.handleWebhook(dto())).resolves.toBe('duplicate');
    expect(manager.update).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('rejects a currency mismatch', async () => {
    const { service } = setup();
    await expect(service.handleWebhook(dto({ currency: 'USD' }))).rejects.toThrow('Currency mismatch');
  });
});
