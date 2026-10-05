import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Used by the TypeORM CLI only (migrations). The app builds its own connection in AppModule.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
