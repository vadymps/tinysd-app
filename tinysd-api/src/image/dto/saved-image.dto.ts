import { IsString } from 'class-validator';

export class SaveImageDto {
  @IsString()
  imageUrl: string;

  @IsString()
  prompt: string;
}

export class SavedImageDto {
  id: string;
  filename: string;
  originalUrl: string;
  prompt: string;
  savedAt: Date;
  localPath: string;
}
