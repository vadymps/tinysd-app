import { ObjectId } from 'mongodb';

export class SavedImage {
  constructor(
    public filename: string,
    public originalUrl: string,
    public prompt: string,
    public savedAt: Date,
    public localPath: string,
    public _id?: ObjectId,
  ) {}
}
