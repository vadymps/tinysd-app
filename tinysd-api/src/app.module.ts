import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogsModule } from './logs/logs.module';
import { ImageModule } from './image/image.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    LogsModule,
    ImageModule,
  ],
})
export class AppModule {}
