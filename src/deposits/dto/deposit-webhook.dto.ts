import { IsIn, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export const DEPOSIT_STATUSES = ['success', 'pending', 'failed'] as const;
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];

/** Callback body sent by the payment provider (PSP) when a deposit changes status. */
export class DepositWebhookDto {
  @IsString()
  @Length(1, 128)
  providerTxId!: string;

  @IsUUID()
  accountId!: string;

  /** Integer minor units as a string, e.g. "2500" = 25.00 */
  @Matches(/^[1-9]\d{0,11}$/)
  amountMinor!: string;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsIn(DEPOSIT_STATUSES)
  status!: DepositStatus;

  @IsOptional()
  @IsString()
  payerEmail?: string;

  @IsOptional()
  @IsString()
  cardMask?: string;
}
