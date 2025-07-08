import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ImageProvider } from '../entities/image-settings.entity';

export class CreateImageSettingsDto {
  @IsEnum(ImageProvider)
  provider: ImageProvider;

  @IsString()
  providerName: string;

  @IsString()
  apiKey: string;

  @IsString()
  apiUrl: string;

  @IsOptional()
  @IsString()
  defaultNegativePrompt?: string;

  @IsOptional()
  @IsString()
  defaultWidth?: string;

  @IsOptional()
  @IsString()
  defaultHeight?: string;

  @IsOptional()
  @IsString()
  defaultSamples?: string;

  @IsOptional()
  @IsString()
  defaultNumInferenceSteps?: string;

  @IsOptional()
  @IsNumber()
  defaultGuidanceScale?: number;

  @IsOptional()
  @IsString()
  defaultScheduler?: string;

  @IsOptional()
  @IsNumber()
  defaultSeed?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateImageSettingsDto {
  @IsOptional()
  @IsEnum(ImageProvider)
  provider?: ImageProvider;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  defaultNegativePrompt?: string;

  @IsOptional()
  @IsString()
  defaultWidth?: string;

  @IsOptional()
  @IsString()
  defaultHeight?: string;

  @IsOptional()
  @IsString()
  defaultSamples?: string;

  @IsOptional()
  @IsString()
  defaultNumInferenceSteps?: string;

  @IsOptional()
  @IsNumber()
  defaultGuidanceScale?: number;

  @IsOptional()
  @IsString()
  defaultScheduler?: string;

  @IsOptional()
  @IsNumber()
  defaultSeed?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ImageSettingsDto {
  id: string;
  provider: ImageProvider;
  providerName: string;
  apiKey: string;
  apiUrl: string;
  defaultNegativePrompt: string;
  defaultWidth: string;
  defaultHeight: string;
  defaultSamples: string;
  defaultNumInferenceSteps: string;
  defaultGuidanceScale: number;
  defaultScheduler: string;
  defaultSeed: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
