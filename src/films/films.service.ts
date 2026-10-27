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
import { CreateFilmDto } from './dto/create-film.dto';
import { FilmResponseDto } from './dto/film-response.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './schemas/film.schema';

@Injectable()
export class FilmsService {
  constructor(
    @InjectModel(Film.name)
    private readonly filmModel: Model<Film>,
    @Inject(forwardRef(() => ShowingsService))
    private readonly showingsService: ShowingsService,
  ) {}

  async create(dto: CreateFilmDto): Promise<FilmResponseDto> {
    const film = await this.filmModel.create({
      title: dto.title,
      durationMinutes: dto.durationMinutes,
      releaseYear: dto.releaseYear,
    });
    return this.toResponse(film);
  }

  async findAll(): Promise<FilmResponseDto[]> {
    const films = await this.filmModel.find().lean();
    return films.map((film) => this.toResponse(film));
  }

  async findOne(id: string): Promise<FilmResponseDto> {
    const film = await this.filmModel.findById(id).lean();
    if (!film) {
      throw new NotFoundException(`Фільм з id ${id} не знайдено`);
    }
    return this.toResponse(film);
  }

  async update(id: string, dto: UpdateFilmDto): Promise<FilmResponseDto> {
    const film = await this.filmModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!film) {
      throw new NotFoundException(`Фільм з id ${id} не знайдено`);
    }
    return this.toResponse(film);
  }

  async remove(id: string): Promise<void> {
    const film = await this.filmModel.findById(id);
    if (!film) {
      throw new NotFoundException(`Фільм з id ${id} не знайдено`);
    }
    if (await this.showingsService.existsForFilm(id)) {
      throw new ConflictException(
        `Фільм "${film.title}" не можна видалити: на нього посилаються сеанси`,
      );
    }
    await film.deleteOne();
  }

  private toResponse(film: {
    _id: unknown;
    title: string;
    durationMinutes: number;
    releaseYear: number;
  }): FilmResponseDto {
    return {
      id: String(film._id),
      title: film.title,
      durationMinutes: film.durationMinutes,
      releaseYear: film.releaseYear,
    };
  }
}
