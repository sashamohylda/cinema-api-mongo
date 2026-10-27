import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HallDocument = HydratedDocument<Hall>;

@Schema({ collection: 'halls' })
export class Hall {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seatsPerRow: number;
}

export const HallSchema = SchemaFactory.createForClass(Hall);
