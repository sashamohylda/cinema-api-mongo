import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingView } from './dto/booking-response.dto';
import { Booking, Showing } from './schemas/showing.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Showing.name)
    private readonly showingModel: Model<Showing>,
  ) {}

  async create(showingId: string, dto: CreateBookingDto): Promise<BookingView> {
    const showing = await this.showingModel.findById(showingId).lean();
    if (!showing) {
      throw new NotFoundException(`Сеанс з id ${showingId} не знайдено`);
    }

    // Межі залу перевіряємо до оновлення: місце є в залі, лише якщо воно
    // присутнє в масиві seats сеансу (seats будується зі схеми залу).
    const hallSeats = new Set(showing.seats.map((s) => `${s.row}:${s.seat}`));
    const outside = dto.seats.find((s) => !hallSeats.has(`${s.row}:${s.seat}`));
    if (outside) {
      throw new BadRequestException(
        `Місця ряд ${outside.row}, місце ${outside.seat} немає в залі`,
      );
    }

    const totalPrice = showing.price * dto.seats.length;
    const bookingId = new Types.ObjectId();
    const bookedSeats = dto.seats.map(({ row, seat }) => ({ row, seat }));

    const filter = {
      _id: showingId,
      $and: dto.seats.map((s) => ({
        seats: { $elemMatch: { row: s.row, seat: s.seat, bookingId: null } },
      })),
    };
    const update = {
      $set: { 'seats.$[target].bookingId': bookingId },
      $push: {
        bookings: {
          _id: bookingId,
          seats: bookedSeats,
          totalPrice,
          createdAt: new Date(),
        } as Booking,
      },
    };
    const options = {
      arrayFilters: [
        {
          $or: dto.seats.map((s) => ({
            'target.row': s.row,
            'target.seat': s.seat,
          })),
        },
      ],
    };

    const result = await this.showingModel.updateOne(filter, update, options);
    if (result.matchedCount === 0) {
      throw new ConflictException(
        'Одне або кілька місць уже заброньовані на цьому сеансі',
      );
    }

    return {
      id: bookingId.toString(),
      seats: bookedSeats,
      totalPrice,
      createdAt: new Date().toISOString(),
    };
  }

  async findAll(): Promise<BookingView[]> {
    const showings = await this.showingModel.find({}, { bookings: 1 }).lean();
    return showings.flatMap((showing) =>
      showing.bookings.map((booking) => this.toView(booking)),
    );
  }

  async findByShowing(showingId: string): Promise<BookingView[]> {
    const showing = await this.showingModel
      .findById(showingId, { bookings: 1 })
      .lean();
    if (!showing) {
      throw new NotFoundException(`Сеанс з id ${showingId} не знайдено`);
    }
    return showing.bookings.map((booking) => this.toView(booking));
  }

  async remove(bookingId: string): Promise<void> {
    const id = new Types.ObjectId(bookingId);
    const result = await this.showingModel.updateOne(
      { 'bookings._id': id },
      {
        $set: { 'seats.$[target].bookingId': null },
        $pull: { bookings: { _id: id } },
      },
      { arrayFilters: [{ 'target.bookingId': id }] },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Бронювання з id ${bookingId} не знайдено`);
    }
  }

  private toView(booking: Booking): BookingView {
    return {
      id: String(booking._id),
      seats: booking.seats.map(({ row, seat }) => ({ row, seat })),
      totalPrice: booking.totalPrice,
      createdAt: new Date(booking.createdAt).toISOString(),
    };
  }
}
