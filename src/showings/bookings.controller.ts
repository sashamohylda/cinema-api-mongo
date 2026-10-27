import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { BookingsService } from './bookings.service';
import { BookingView } from './dto/booking-response.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOkResponse({ type: [BookingView], description: 'Усі бронювання' })
  findAll(): Promise<BookingView[]> {
    return this.bookingsService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ObjectId бронювання' })
  @ApiNoContentResponse({ description: 'Бронювання скасовано' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Бронювання з таким id немає' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.bookingsService.remove(id);
  }
}
