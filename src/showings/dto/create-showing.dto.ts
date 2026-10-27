import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsMongoId, Min } from 'class-validator';

export class CreateShowingDto {
  @ApiProperty({ example: '3f1c2b8e-6a9d-4c1e-9b7a-2d5e8f0a1b2c' })
  @IsMongoId()
  filmId!: string;

  @ApiProperty({ example: '9b2d7c1a-3e4f-4a5b-8c6d-7e8f9a0b1c2d' })
  @IsMongoId()
  hallId!: string;

  @ApiProperty({
    example: '2026-12-01T18:30:00.000Z',
    description: 'Дата й час початку у форматі ISO 8601, не в минулому',
  })
  @IsISO8601(
    { strict: true },
    { message: 'startsAt має бути коректною датою у форматі ISO 8601' },
  )
  startsAt!: string;

  @ApiProperty({
    example: 12500,
    minimum: 1,
    description: 'Ціна квитка в копійках',
  })
  @IsInt({ message: 'price має бути цілим числом' })
  @Min(1, { message: 'price має бути додатним числом' })
  price!: number;
}
