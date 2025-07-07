import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateLogDto {
  @IsString()
  referer: string;

  @IsNumber()
  datetime: number;
}

export class UpdateLogDto {
  @IsOptional()
  @IsString()
  referer?: string;

  @IsOptional()
  @IsNumber()
  datetime?: number;
}
