import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { BookingsService } from './bookings.service';
import { BookingView } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateShowingDto } from './dto/create-showing.dto';
import { FindShowingsQueryDto } from './dto/find-showings-query.dto';
import {
  SeatStatus,
  ShowingsPage,
  ShowingView,
} from './dto/showing-response.dto';
import { ShowingsService } from './showings.service';

@ApiTags('showings')
@Controller('showings')
export class ShowingsController {
  constructor(
    private readonly showingsService: ShowingsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ShowingView, description: 'Сеанс створено' })
  @ApiBadRequestResponse({
    description:
      'Фільму або залу не існує; startsAt не ISO 8601 або в минулому; ' +
      'price не є цілим додатним; некоректний формат ідентифікаторів',
  })
  create(@Body() dto: CreateShowingDto): Promise<ShowingView> {
    return this.showingsService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    type: ShowingsPage,
    description: 'Сторінка сеансів: items, total, page, limit',
  })
  @ApiBadRequestResponse({
    description: 'date не у форматі YYYY-MM-DD, filmId не ObjectId, або page/limit/sort поза межами',
  })
  findAll(@Query() query: FindShowingsQueryDto): Promise<ShowingsPage> {
    return this.showingsService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ObjectId сеансу' })
  @ApiOkResponse({ type: ShowingView, description: 'Сеанс' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Сеансу з таким id немає' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<ShowingView> {
    return this.showingsService.findOne(id);
  }

  @Get(':id/seats')
  @ApiParam({ name: 'id', description: 'ObjectId сеансу' })
  @ApiOkResponse({
    type: [SeatStatus],
    description: 'Місця залу з ознакою зайнятості',
  })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Сеансу з таким id немає' })
  getSeats(@Param('id', ParseObjectIdPipe) id: string): Promise<SeatStatus[]> {
    return this.showingsService.getSeatMap(id);
  }

  @Post(':id/bookings')
  @ApiParam({ name: 'id', description: 'ObjectId сеансу' })
  @ApiCreatedResponse({ type: BookingView, description: 'Бронювання створено' })
  @ApiBadRequestResponse({
    description:
      'seats порожній, елемент без row/seat, місце повторюється, ' +
      'місця немає в залі або id не є коректним ObjectId',
  })
  @ApiNotFoundResponse({ description: 'Сеансу з таким id немає' })
  @ApiConflictResponse({
    description: 'Хоча б одне місце вже заброньоване на цьому сеансі',
  })
  createBooking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingView> {
    return this.bookingsService.create(id, dto);
  }

  @Get(':id/bookings')
  @ApiParam({ name: 'id', description: 'ObjectId сеансу' })
  @ApiOkResponse({ type: [BookingView], description: 'Бронювання сеансу' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Сеансу з таким id немає' })
  findBookings(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<BookingView[]> {
    return this.bookingsService.findByShowing(id);
  }
}
