import { ApiProperty } from '@nestjs/swagger';

export class ShowingView {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Dune: Part Two' })
  filmTitle: string;

  @ApiProperty({ example: 'Червона зала' })
  hallName: string;

  @ApiProperty({ example: '2026-12-01T18:30:00.000Z' })
  startsAt: string;

  @ApiProperty({ example: 12500, description: 'Ціна квитка в копійках' })
  price: number;
}

export class ShowingsPage {
  @ApiProperty({ type: [ShowingView] })
  items: ShowingView[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class SeatStatus {
  @ApiProperty({ example: 1 })
  row: number;

  @ApiProperty({ example: 5 })
  seat: number;

  @ApiProperty({ example: false })
  isBooked: boolean;
}
