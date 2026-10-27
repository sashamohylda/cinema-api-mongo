import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema({ collection: 'films' })
export class Film {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop({ required: true })
  releaseYear: number;
}

export const FilmSchema = SchemaFactory.createForClass(Film);
