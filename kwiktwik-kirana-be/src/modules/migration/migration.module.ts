import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { MigrationCronService } from './migration-cron.service';
import { BetterAuthValidator } from './services/better-auth-validator.service';
import { KiranaFeDataService } from './services/kirana-fe-data.service';
import { TableMigrationService } from './services/table-migration.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [MigrationController],
  providers: [
    MigrationService,
    MigrationCronService,
    BetterAuthValidator,
    KiranaFeDataService,
    TableMigrationService,
  ],
  exports: [MigrationService],
})
export class MigrationModule {}
