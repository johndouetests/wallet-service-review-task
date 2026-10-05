import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1729000000000 implements MigrationInterface {
  name = 'Init1729000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        currency char(3) NOT NULL,
        balance_minor bigint NOT NULL DEFAULT 0 CHECK (balance_minor >= 0),
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`
      CREATE TABLE transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id uuid NOT NULL REFERENCES accounts(id),
        type varchar(32) NOT NULL,
        amount_minor bigint NOT NULL,
        currency char(3) NOT NULL,
        provider_tx_id varchar(128),
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`CREATE INDEX idx_transactions_account_created ON transactions (account_id, created_at DESC)`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_transactions_provider_tx ON transactions (provider_tx_id) WHERE provider_tx_id IS NOT NULL`);
    await queryRunner.query(`
      CREATE TABLE outbox_events (
        id bigserial PRIMARY KEY,
        routing_key varchar(128) NOT NULL,
        payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        published_at timestamptz
      )`);
    await queryRunner.query(`CREATE INDEX idx_outbox_unpublished ON outbox_events (id) WHERE published_at IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE outbox_events`);
    await queryRunner.query(`DROP TABLE transactions`);
    await queryRunner.query(`DROP TABLE accounts`);
  }
}
