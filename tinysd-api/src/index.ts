import express from 'express';
import { connectToDatabase } from './services/database.service';
import { logsRouter } from './routes/logs.router';

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.use('/logs', logsRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
