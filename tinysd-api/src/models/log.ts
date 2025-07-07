// External dependencies
import { ObjectId } from 'mongodb';

// Class Implementation
export default class Log {
  constructor(
    public referer: string,
    public datetime: number,
    public id?: ObjectId,
  ) {}
}
