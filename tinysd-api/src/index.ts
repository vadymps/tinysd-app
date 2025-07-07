import express from 'express';
import { connectToDatabase } from './services/database.service';
import { logsRouter } from './routes/logs.router';
import { imageRouter } from './routes/image.router';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.use('/api/logs', logsRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });

app.use('/api/image', imageRouter);
