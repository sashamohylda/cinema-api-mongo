import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsModule } from '../films/films.module';
import { Film, FilmSchema } from '../films/schemas/film.schema';
import { HallsModule } from '../halls/halls.module';
import { Hall, HallSchema } from '../halls/schemas/hall.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ShowingsController } from './showings.controller';
import { ShowingsService } from './showings.service';
import { Showing, ShowingSchema } from './schemas/showing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Showing.name, schema: ShowingSchema },
      { name: Film.name, schema: FilmSchema },
      { name: Hall.name, schema: HallSchema },
    ]),
    forwardRef(() => FilmsModule),
    forwardRef(() => HallsModule),
  ],
  controllers: [ShowingsController, BookingsController],
  providers: [ShowingsService, BookingsService],
  exports: [ShowingsService],
})
export class ShowingsModule {}
