/**
 * Money is stored and moved as integer minor units (cents) in a bigint column.
 * TypeORM returns bigint columns as strings, so arithmetic goes through BigInt
 * and never through JS numbers.
 */
export type MinorUnits = string;

export function addMinor(a: MinorUnits, b: MinorUnits): MinorUnits {
  return (BigInt(a) + BigInt(b)).toString();
}

export function isPositiveMinor(value: MinorUnits): boolean {
  return /^\d+$/.test(value) && BigInt(value) > 0n;
}
