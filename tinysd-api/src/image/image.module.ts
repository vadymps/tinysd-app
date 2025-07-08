import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageSettingsController } from './controllers/image-settings.controller';
import { ImageSettingsService } from './services/image-settings.service';
import { ImageProviderService } from './services/image-provider.service';
import { DatabaseModule } from '../database/database.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [DatabaseModule, LogsModule],
  controllers: [ImageController, ImageSettingsController],
  providers: [ImageService, ImageSettingsService, ImageProviderService],
})
export class ImageModule {}
