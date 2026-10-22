import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export const DEPOSIT_STATUSES = ['success', 'pending', 'failed'] as const;
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];

/** Callback body sent by the payment provider (PSP) when a deposit changes status. */
export class DepositWebhookDto {
  @IsString()
  @Length(1, 128)
  providerTxId!: string;

  @IsUUID()
  accountId!: string;

  /** PSP v2 sends the amount in major units, e.g. 25.5 */
  @IsNumber()
  amount!: number;

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
