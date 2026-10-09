import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AccountsModule } from './accounts/accounts.module';
import { DepositsModule } from './deposits/deposits.module';
import { HealthModule } from './health/health.module';
import { MessagingModule } from './messaging/messaging.module';
import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    MessagingModule,
    OutboxModule,
    AccountsModule,
    DepositsModule,
    HealthModule,
  ],
})
export class AppModule {}
