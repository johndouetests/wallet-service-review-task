import { BonusService } from '../src/bonus/bonus.service';

describe('BonusService', () => {
  it('credits welcome bonus on first deposit', async () => {
    const bonusRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn() };
    const txRepo = { insert: jest.fn() };
    const accountRepo = { findOneBy: jest.fn().mockResolvedValue({ id: 'acc-1', bonusOptOut: false }) };
    const dataSource = { query: jest.fn() };
    const affiliate = { sendFtd: jest.fn() };
    const service = new BonusService(bonusRepo as any, txRepo as any, accountRepo as any, dataSource as any, affiliate as any);

    await service.processFirstDeposit('acc-1', 50, 'EUR', 'tx-1');

    expect(bonusRepo.save).toHaveBeenCalled();
    expect(affiliate.sendFtd).toHaveBeenCalled();
  });
});
