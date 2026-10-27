import { ApiProperty } from '@nestjs/swagger';

export class SeatDto {
  @ApiProperty({ example: 1 })
  row: number;

  @ApiProperty({ example: 5 })
  seat: number;
}

export class HallResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Червона зала' })
  name: string;

  @ApiProperty({ example: 3 })
  rows: number;

  @ApiProperty({ example: 5 })
  seatsPerRow: number;
}

export class HallWithSeatsDto extends HallResponseDto {
  @ApiProperty({ type: [SeatDto] })
  seats: SeatDto[];
}
