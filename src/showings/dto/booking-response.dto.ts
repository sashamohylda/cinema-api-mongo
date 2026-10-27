import { ApiProperty } from '@nestjs/swagger';

export class BookedSeatDto {
  @ApiProperty({ example: 1 })
  row: number;

  @ApiProperty({ example: 5 })
  seat: number;
}

export class BookingView {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ type: [BookedSeatDto] })
  seats: BookedSeatDto[];

  @ApiProperty({ example: 25000, description: 'Підсумкова ціна в копійках' })
  totalPrice: number;

  @ApiProperty({ example: '2026-12-01T18:30:00.000Z' })
  createdAt: string;
}
