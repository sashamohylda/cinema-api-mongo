import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShowingsService } from '../showings/showings.service';
import { CreateHallDto } from './dto/create-hall.dto';
import {
  HallResponseDto,
  HallWithSeatsDto,
  SeatDto,
} from './dto/hall-response.dto';
import { Hall } from './schemas/hall.schema';

@Injectable()
export class HallsService {
  constructor(
    @InjectModel(Hall.name)
    private readonly hallModel: Model<Hall>,
    @Inject(forwardRef(() => ShowingsService))
    private readonly showingsService: ShowingsService,
  ) {}

  async create(dto: CreateHallDto): Promise<HallResponseDto> {
    const name = dto.name.trim();
    const existing = await this.hallModel.findOne({ name }).lean();
    if (existing) {
      throw new ConflictException(`Зал з назвою "${name}" вже існує`);
    }
    const hall = await this.hallModel.create({
      name,
      rows: dto.rows,
      seatsPerRow: dto.seatsPerRow,
    });
    return this.toResponse(hall);
  }

  async findAll(): Promise<HallResponseDto[]> {
    const halls = await this.hallModel.find().lean();
    return halls.map((hall) => this.toResponse(hall));
  }

  async findOneWithSeats(id: string): Promise<HallWithSeatsDto> {
    const hall = await this.hallModel.findById(id).lean();
    if (!hall) {
      throw new NotFoundException(`Зал з id ${id} не знайдено`);
    }
    return {
      ...this.toResponse(hall),
      seats: this.buildSeats(hall.rows, hall.seatsPerRow),
    };
  }

  async remove(id: string): Promise<void> {
    const hall = await this.hallModel.findById(id);
    if (!hall) {
      throw new NotFoundException(`Зал з id ${id} не знайдено`);
    }
    if (await this.showingsService.existsForHall(id)) {
      throw new ConflictException(
        `Зал "${hall.name}" не можна видалити: на нього посилаються сеанси`,
      );
    }
    await hall.deleteOne();
  }

  buildSeats(rows: number, seatsPerRow: number): SeatDto[] {
    const seats: SeatDto[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        seats.push({ row, seat });
      }
    }
    return seats;
  }

  private toResponse(hall: {
    _id: unknown;
    name: string;
    rows: number;
    seatsPerRow: number;
  }): HallResponseDto {
    return {
      id: String(hall._id),
      name: hall.name,
      rows: hall.rows,
      seatsPerRow: hall.seatsPerRow,
    };
  }
}
