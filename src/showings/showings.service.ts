import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Film } from '../films/schemas/film.schema';
import { Hall } from '../halls/schemas/hall.schema';
import { CreateShowingDto } from './dto/create-showing.dto';
import { FindShowingsQueryDto } from './dto/find-showings-query.dto';
import {
  SeatStatus,
  ShowingsPage,
  ShowingView,
} from './dto/showing-response.dto';
import { Showing, ShowingDocument } from './schemas/showing.schema';

@Injectable()
export class ShowingsService {
  constructor(
    @InjectModel(Showing.name)
    private readonly showingModel: Model<Showing>,
    @InjectModel(Film.name)
    private readonly filmModel: Model<Film>,
    @InjectModel(Hall.name)
    private readonly hallModel: Model<Hall>,
  ) {}

  async create(dto: CreateShowingDto): Promise<ShowingView> {
    const film = await this.filmModel.findById(dto.filmId).lean();
    if (!film) {
      throw new BadRequestException(`Фільм з id ${dto.filmId} не знайдено`);
    }
    const hall = await this.hallModel.findById(dto.hallId).lean();
    if (!hall) {
      throw new BadRequestException(`Зал з id ${dto.hallId} не знайдено`);
    }

    const startsAt = new Date(dto.startsAt);
    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('startsAt вказує на момент у минулому');
    }

    const seats = [];
    for (let row = 1; row <= hall.rows; row++) {
      for (let seat = 1; seat <= hall.seatsPerRow; seat++) {
        seats.push({ row, seat, bookingId: null });
      }
    }

    const showing = await this.showingModel.create({
      film: film._id,
      hall: hall._id,
      startsAt,
      price: dto.price,
      seats,
      bookings: [],
    });

    return {
      id: showing._id.toString(),
      filmTitle: film.title,
      hallName: hall.name,
      startsAt: startsAt.toISOString(),
      price: dto.price,
    };
  }

  async findAll(query: FindShowingsQueryDto): Promise<ShowingsPage> {
    const filter: Record<string, unknown> = {};
    if (query.filmId) {
      filter.film = new Types.ObjectId(query.filmId);
    }
    if (query.date) {
      const from = new Date(`${query.date}T00:00:00.000Z`);
      const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
      filter.startsAt = { $gte: from, $lt: to };
    }

    const direction = query.sort === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      this.showingModel
        .find(filter)
        .sort({ startsAt: direction, _id: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate<{ film: { title: string } }>('film', 'title')
        .populate<{ hall: { name: string } }>('hall', 'name')
        .lean(),
      this.showingModel.countDocuments(filter),
    ]);

    return {
      items: items.map((showing) => this.toView(showing)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string): Promise<ShowingView> {
    const showing = await this.showingModel
      .findById(id)
      .populate<{ film: { title: string } }>('film', 'title')
      .populate<{ hall: { name: string } }>('hall', 'name')
      .lean();
    if (!showing) {
      throw new NotFoundException(`Сеанс з id ${id} не знайдено`);
    }
    return this.toView(showing);
  }

  async getSeatMap(id: string): Promise<SeatStatus[]> {
    const showing = await this.showingModel.findById(id).lean();
    if (!showing) {
      throw new NotFoundException(`Сеанс з id ${id} не знайдено`);
    }
    return showing.seats.map((seat) => ({
      row: seat.row,
      seat: seat.seat,
      isBooked: seat.bookingId !== null,
    }));
  }

  async getById(id: string): Promise<ShowingDocument> {
    const showing = await this.showingModel.findById(id);
    if (!showing) {
      throw new NotFoundException(`Сеанс з id ${id} не знайдено`);
    }
    return showing;
  }

  async existsForFilm(filmId: string): Promise<boolean> {
    return (await this.showingModel.countDocuments({ film: new Types.ObjectId(filmId) })) > 0;
  }

  async existsForHall(hallId: string): Promise<boolean> {
    return (await this.showingModel.countDocuments({ hall: new Types.ObjectId(hallId) })) > 0;
  }

  private toView(showing: {
    _id: unknown;
    film: { title: string } | unknown;
    hall: { name: string } | unknown;
    startsAt: Date;
    price: number;
  }): ShowingView {
    return {
      id: String(showing._id),
      filmTitle: (showing.film as { title: string }).title,
      hallName: (showing.hall as { name: string }).name,
      startsAt: showing.startsAt.toISOString(),
      price: showing.price,
    };
  }
}
