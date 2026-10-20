import { MigrationInterface, QueryRunner } from 'typeorm';

export class WelcomeBonus1729800000000 implements MigrationInterface {
  name = 'WelcomeBonus1729800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE bonuses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id uuid NOT NULL,
        type varchar(32) NOT NULL,
        amount float NOT NULL,
        currency char(3) NOT NULL,
        deposit_tx_id varchar(128) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`ALTER TABLE transactions ADD COLUMN is_bonus boolean NOT NULL`);
    await queryRunner.query(`ALTER TABLE accounts ADD COLUMN bonus_opt_out boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
