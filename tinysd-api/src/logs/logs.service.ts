import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { CreateLogDto, UpdateLogDto } from './dto/log.dto';

@Injectable()
export class LogsService {
  constructor(@Inject('LOGS_COLLECTION') private logsCollection: Collection) {}

  async findAll() {
    return await this.logsCollection.find({}).toArray();
  }

  async findOne(id: string) {
    const objectId = new ObjectId(id);
    const log = await this.logsCollection.findOne({ _id: objectId });

    if (!log) {
      throw new NotFoundException(
        `Unable to find matching document with id: ${id}`,
      );
    }

    return log;
  }

  async create(createLogDto: CreateLogDto) {
    const result = await this.logsCollection.insertOne(createLogDto);

    if (!result.insertedId) {
      throw new Error('Failed to create a new log.');
    }

    return {
      message: `Successfully created a new log with id ${result.insertedId}`,
      id: result.insertedId,
    };
  }

  async update(id: string, updateLogDto: UpdateLogDto) {
    const objectId = new ObjectId(id);
    const result = await this.logsCollection.updateOne(
      { _id: objectId },
      { $set: updateLogDto },
    );

    if (!result.matchedCount) {
      throw new NotFoundException(`Log with id ${id} does not exist`);
    }

    return { message: `Successfully updated log with id ${id}` };
  }

  async remove(id: string) {
    const objectId = new ObjectId(id);
    const result = await this.logsCollection.deleteOne({ _id: objectId });

    if (!result.deletedCount) {
      throw new NotFoundException(`Log with id ${id} does not exist`);
    }

    return { message: `Successfully removed log with id ${id}` };
  }
}
