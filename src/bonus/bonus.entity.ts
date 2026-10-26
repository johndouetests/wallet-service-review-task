import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bonuses')
export class Bonus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ name: 'deposit_tx_id', type: 'varchar', length: 128 })
  depositTxId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
