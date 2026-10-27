import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateFilmDto {
  @ApiPropertyOptional({ example: 'Dune: Part Two (IMAX)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 170, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 2024, minimum: 1888, maximum: 2100 })
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(2100)
  releaseYear?: number;
}
