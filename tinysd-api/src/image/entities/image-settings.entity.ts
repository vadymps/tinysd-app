import { ObjectId } from 'mongodb';

export enum ImageProvider {
  MODELSLAB = 'modelslab',
  STABILITY_AI = 'stability_ai',
  OPENAI_DALLE = 'openai_dalle',
  REPLICATE = 'replicate',
}

export class ImageSettings {
  constructor(
    public provider: ImageProvider,
    public providerName: string,
    public apiKey: string,
    public apiUrl: string,
    public defaultNegativePrompt: string,
    public defaultWidth: string,
    public defaultHeight: string,
    public defaultSamples: string,
    public defaultNumInferenceSteps: string,
    public defaultGuidanceScale: number,
    public defaultScheduler: string,
    public defaultSeed: number | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public _id?: ObjectId,
  ) {}
}
