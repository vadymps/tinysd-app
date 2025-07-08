import { ObjectId } from 'mongodb';

export class Log {
  constructor(
    public referer: string,
    public datetime: number,
    public action: string, // 'generate' | 'save' | 'delete' | 'view' | 'api_error' | 'generation_error'
    public prompt?: string,
    public imageUrl?: string,
    public imageName?: string,
    public error?: string,
    public provider?: string,
    public providerName?: string,
    public _id?: ObjectId,
  ) {}
}
