import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient, Db, Collection } from 'mongodb';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DB_CONN_STRING');
        if (!connectionString) {
          throw new Error(
            'DB_CONN_STRING is not defined in the environment variables',
          );
        }

        const client = new MongoClient(connectionString);
        await client.connect();

        const dbName = configService.get<string>('DB_NAME');
        const db = client.db(dbName);

        console.log(`Successfully connected to database: ${db.databaseName}`);
        return db;
      },
      inject: [ConfigService],
    },
    {
      provide: 'LOGS_COLLECTION',
      useFactory: (db: Db, configService: ConfigService) => {
        const collectionName = configService.get<string>(
          'LOGS_COLLECTION_NAME',
        );
        if (!collectionName) {
          throw new Error(
            'LOGS_COLLECTION_NAME is not defined in the environment variables',
          );
        }

        const collection = db.collection(collectionName);
        console.log(
          `Successfully connected to collection: ${collection.collectionName}`,
        );
        return collection;
      },
      inject: ['DATABASE_CONNECTION', ConfigService],
    },
  ],
  exports: ['DATABASE_CONNECTION', 'LOGS_COLLECTION'],
})
export class DatabaseModule {}
