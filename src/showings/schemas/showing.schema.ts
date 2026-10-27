import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Місце в залі всередині сеансу. Вільне, поки bookingId === null.
@Schema({ _id: false })
export class Seat {
  @Prop({ required: true })
  row: number;

  @Prop({ required: true })
  seat: number;

  @Prop({ type: Types.ObjectId, default: null })
  bookingId: Types.ObjectId | null;
}
export const SeatSchema = SchemaFactory.createForClass(Seat);

// Пара row/seat у бронюванні (дублікат переліку місць бронювання).
@Schema({ _id: false })
export class BookedSeat {
  @Prop({ required: true })
  row: number;

  @Prop({ required: true })
  seat: number;
}
export const BookedSeatSchema = SchemaFactory.createForClass(BookedSeat);

// Бронювання, вкладене в документ сеансу. _id генерується в коді перед записом.
@Schema()
export class Booking {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ type: [BookedSeatSchema], required: true })
  seats: BookedSeat[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  createdAt: Date;
}
export const BookingSchema = SchemaFactory.createForClass(Booking);

export type ShowingDocument = HydratedDocument<Showing>;

@Schema({ collection: 'showings' })
export class Showing {
  @Prop({ type: Types.ObjectId, ref: 'Film', required: true })
  film: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hall', required: true })
  hall: Types.ObjectId;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [SeatSchema], required: true })
  seats: Seat[];

  @Prop({ type: [BookingSchema], default: [] })
  bookings: Booking[];
}

export const ShowingSchema = SchemaFactory.createForClass(Showing);
