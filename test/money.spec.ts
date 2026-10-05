import { addMinor, isPositiveMinor } from '../src/common/money';

describe('money', () => {
  it('adds minor units without float rounding', () => {
    expect(addMinor('10', '20')).toBe('30');
    expect(addMinor('900719925474099100', '1')).toBe('900719925474099101');
  });

  it('accepts only positive integers', () => {
    expect(isPositiveMinor('1')).toBe(true);
    expect(isPositiveMinor('0')).toBe(false);
    expect(isPositiveMinor('-5')).toBe(false);
    expect(isPositiveMinor('1.5')).toBe(false);
  });
});
