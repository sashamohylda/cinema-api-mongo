import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateFilmDto } from './dto/create-film.dto';
import { FilmResponseDto } from './dto/film-response.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { FilmsService } from './films.service';

@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  @ApiCreatedResponse({ type: FilmResponseDto, description: 'Фільм створено' })
  @ApiBadRequestResponse({
    description: 'Поле відсутнє або має неправильний тип',
  })
  create(@Body() dto: CreateFilmDto): Promise<FilmResponseDto> {
    return this.filmsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [FilmResponseDto], description: 'Масив усіх фільмів' })
  findAll(): Promise<FilmResponseDto[]> {
    return this.filmsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ObjectId фільму' })
  @ApiOkResponse({ type: FilmResponseDto, description: 'Фільм' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Фільму з таким id немає' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<FilmResponseDto> {
    return this.filmsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ObjectId фільму' })
  @ApiOkResponse({ type: FilmResponseDto, description: 'Оновлений фільм' })
  @ApiBadRequestResponse({
    description: 'Неправильний тип поля або id не є коректним ObjectId',
  })
  @ApiNotFoundResponse({ description: 'Фільму з таким id немає' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateFilmDto,
  ): Promise<FilmResponseDto> {
    return this.filmsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ObjectId фільму' })
  @ApiNoContentResponse({ description: 'Фільм видалено' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Фільму з таким id немає' })
  @ApiConflictResponse({ description: 'На фільм посилається сеанс' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.filmsService.remove(id);
  }
}
