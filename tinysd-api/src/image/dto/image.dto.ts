import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  negative_prompt?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  samples?: string;

  @IsOptional()
  @IsString()
  num_inference_steps?: string;

  @IsOptional()
  @IsNumber()
  guidance_scale?: number;

  @IsOptional()
  @IsString()
  scheduler?: string;

  @IsOptional()
  @IsNumber()
  seed?: number;
}
