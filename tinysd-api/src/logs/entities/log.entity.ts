import { ObjectId } from 'mongodb';

export class Log {
  constructor(
    public referer: string,
    public datetime: number,
    public action: string, // 'generate' | 'save' | 'delete' | 'view'
    public prompt?: string,
    public imageUrl?: string,
    public imageName?: string,
    public _id?: ObjectId,
  ) {}
}
