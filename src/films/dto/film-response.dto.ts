import { ApiProperty } from '@nestjs/swagger';

export class FilmResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Dune: Part Two' })
  title: string;

  @ApiProperty({ example: 166 })
  durationMinutes: number;

  @ApiProperty({ example: 2024 })
  releaseYear: number;
}
