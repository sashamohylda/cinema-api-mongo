import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class SeatDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  row!: number;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt()
  @Min(1)
  seat!: number;
}

export class CreateBookingDto {
  @ApiProperty({
    type: [SeatDto],
    example: [
      { row: 1, seat: 1 },
      { row: 1, seat: 2 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'seats не може бути порожнім' })
  @ArrayUnique((seat: SeatDto) => `${seat?.row}:${seat?.seat}`, {
    message: 'Одне й те саме місце трапляється в seats двічі',
  })
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats!: SeatDto[];
}
