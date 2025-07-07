import { ObjectId } from 'mongodb';

export class Log {
  constructor(
    public referer: string,
    public datetime: number,
    public _id?: ObjectId,
  ) {}
}
