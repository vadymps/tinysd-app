import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateLogDto {
  @IsString()
  referer: string;

  @IsNumber()
  datetime: number;

  @IsString()
  action: string; // 'generate' | 'save' | 'delete' | 'view' | 'api_error'

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageName?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerName?: string;
}

export class UpdateLogDto {
  @IsOptional()
  @IsString()
  referer?: string;

  @IsOptional()
  @IsNumber()
  datetime?: number;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageName?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerName?: string;
}
