import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateHallDto {
  @ApiProperty({ example: 'Червона зала' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  rows!: number;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  seatsPerRow!: number;
}
