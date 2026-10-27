import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateFilmDto {
  @ApiProperty({ example: 'Dune: Part Two' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 166, minimum: 1 })
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @ApiProperty({ example: 2024, minimum: 1888, maximum: 2100 })
  @IsInt()
  @Min(1888)
  @Max(2100)
  releaseYear!: number;
}
