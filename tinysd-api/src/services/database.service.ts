// External Dependencies
import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

// Global Variables
export const collections: { logs?: mongoDB.Collection } = {};

// Initialize Connection
export async function connectToDatabase() {
  dotenv.config();

  if (process.env.DB_CONN_STRING === undefined) {
    throw new Error(
      'DB_CONN_STRING is not defined in the environment variables',
    );
  }

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING,
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  if (process.env.LOGS_COLLECTION_NAME === undefined) {
    throw new Error(
      'LOGS_COLLECTION_NAME is not defined in the environment variables',
    );
  }

  const logsCollection: mongoDB.Collection = db.collection(
    process.env.LOGS_COLLECTION_NAME,
  );

  collections.logs = logsCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${logsCollection.collectionName}`,
  );
}
