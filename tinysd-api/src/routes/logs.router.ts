// External Dependencies
import * as express from 'express';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../services/database.service';
import Log from '../models/log';

// Global Config
export const logsRouter = express.Router();
logsRouter.use(express.json());

// GET
logsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const logs = await collections.logs?.find({}).toArray();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error });
  }
});

logsRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const query = { _id: new ObjectId(id) };
    const log = await collections.logs?.findOne(query);

    if (log) {
      res.status(200).json(log);
    } else {
      res.status(404).json({
        error: `Unable to find matching document with id: ${req.params.id}`,
      });
    }
  } catch {
    res.status(404).json({
      error: `Unable to find matching document with id: ${req.params.id}`,
    });
  }
});

// POST

logsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newLog = req.body as Log;
    const result = await collections.logs?.insertOne(newLog);

    if (result) {
      res.status(201).json({
        message: `Successfully created a new log with id ${result.insertedId}`,
        id: result.insertedId,
      });
    } else {
      res.status(500).json({ error: 'Failed to create a new log.' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
});

// PUT

// DELETE
logsRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.logs?.deleteOne(query);

    if (result && result.deletedCount) {
      res
        .status(202)
        .json({ message: `Successfully removed log with id ${id}` });
    } else if (!result) {
      res.status(400).json({ error: `Failed to remove log with id ${id}` });
    } else if (!result.deletedCount) {
      res.status(404).json({ error: `Log with id ${id} does not exist` });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
});
