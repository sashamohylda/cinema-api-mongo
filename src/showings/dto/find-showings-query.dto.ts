import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class FindShowingsQueryDto {
  @ApiPropertyOptional({
    example: '3f1c2b8e-6a9d-4c1e-9b7a-2d5e8f0a1b2c',
    description: 'Лише сеанси цього фільму',
  })
  @IsOptional()
  @IsMongoId()
  filmId?: string;

  @ApiPropertyOptional({
    example: '2026-12-01',
    description: 'Лише сеанси, що починаються цієї доби (UTC), YYYY-MM-DD',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date має бути у форматі YYYY-MM-DD',
  })
  @IsISO8601({ strict: true }, { message: 'date має бути існуючою датою' })
  date?: string;

  @ApiPropertyOptional({
    description: 'Номер сторінки, ціле число від 1',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page має бути цілим числом' })
  @Min(1, { message: 'page має бути не менше 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Кількість записів на сторінці, від 1 до 100',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit має бути цілим числом' })
  @Min(1, { message: 'limit має бути не менше 1' })
  @Max(100, { message: 'limit має бути не більше 100' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Порядок за часом початку',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sort має бути asc або desc' })
  sort: 'asc' | 'desc' = 'asc';
}
