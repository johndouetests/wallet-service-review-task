import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win';

/** Append-only ledger. A row is never updated or deleted. */
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: TransactionType;

  @Column({ name: 'amount_minor', type: 'bigint' })
  amountMinor!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ name: 'provider_tx_id', type: 'varchar', length: 128, nullable: true })
  providerTxId!: string | null;

  @Column({ name: 'is_bonus', type: 'boolean' })
  isBonus!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
