import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { DatabaseModule } from '../database/database.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [DatabaseModule, LogsModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
