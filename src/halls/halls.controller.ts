import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateHallDto } from './dto/create-hall.dto';
import { HallResponseDto, HallWithSeatsDto } from './dto/hall-response.dto';
import { HallsService } from './halls.service';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Post()
  @ApiCreatedResponse({ type: HallResponseDto, description: 'Зал створено' })
  @ApiBadRequestResponse({
    description:
      'Поле відсутнє, має неправильний тип або число не є цілим додатним',
  })
  @ApiConflictResponse({ description: 'Зал з такою назвою вже існує' })
  create(@Body() dto: CreateHallDto): Promise<HallResponseDto> {
    return this.hallsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [HallResponseDto], description: 'Масив усіх залів' })
  findAll(): Promise<HallResponseDto[]> {
    return this.hallsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ObjectId залу' })
  @ApiOkResponse({
    type: HallWithSeatsDto,
    description: 'Зал разом з переліком місць',
  })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Залу з таким id немає' })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<HallWithSeatsDto> {
    return this.hallsService.findOneWithSeats(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ObjectId залу' })
  @ApiNoContentResponse({ description: 'Зал видалено' })
  @ApiBadRequestResponse({ description: 'id не є коректним ObjectId' })
  @ApiNotFoundResponse({ description: 'Залу з таким id немає' })
  @ApiConflictResponse({ description: 'На зал посилається сеанс' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.hallsService.remove(id);
  }
}
