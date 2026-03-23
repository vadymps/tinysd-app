import { Module } from '@nestjs/common';
import { LogsController } from './controllers/logs.controller';
import { LogsService } from './services/logs.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}