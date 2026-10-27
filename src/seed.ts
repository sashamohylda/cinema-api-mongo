import { config } from 'dotenv';
import mongoose, { Model, Types } from 'mongoose';
import { Film, FilmSchema } from './films/schemas/film.schema';
import { Hall, HallSchema } from './halls/schemas/hall.schema';
import { Showing, ShowingSchema } from './showings/schemas/showing.schema';

config();

function buildSeats(rows: number, seatsPerRow: number) {
  const seats: { row: number; seat: number; bookingId: null }[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seats.push({ row, seat, bookingId: null });
    }
  }
  return seats;
}

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI as string);
  try {
    const FilmModel = mongoose.model(Film.name, FilmSchema);
    const HallModel = mongoose.model(Hall.name, HallSchema);
    const ShowingModel = mongoose.model(Showing.name, ShowingSchema);

    const findOrCreateFilm = async (data: {
      title: string;
      durationMinutes: number;
      releaseYear: number;
    }) =>
      (await FilmModel.findOne({ title: data.title })) ??
      (await FilmModel.create(data));

    const findOrCreateHall = async (data: {
      name: string;
      rows: number;
      seatsPerRow: number;
    }) =>
      (await HallModel.findOne({ name: data.name })) ??
      (await HallModel.create(data));

    const findOrCreateShowing = async (
      film: { _id: Types.ObjectId },
      hall: { _id: Types.ObjectId; rows: number; seatsPerRow: number },
      startsAt: string,
      price: number,
    ) => {
      const existing = await ShowingModel.findOne({
        film: film._id,
        hall: hall._id,
        startsAt: new Date(startsAt),
      });
      if (existing) return existing;
      return ShowingModel.create({
        film: film._id,
        hall: hall._id,
        startsAt: new Date(startsAt),
        price,
        seats: buildSeats(hall.rows, hall.seatsPerRow),
        bookings: [],
      });
    };

    const dune = await findOrCreateFilm({
      title: 'Dune: Part Two',
      durationMinutes: 166,
      releaseYear: 2024,
    });
    const oppenheimer = await findOrCreateFilm({
      title: 'Oppenheimer',
      durationMinutes: 180,
      releaseYear: 2023,
    });
    const redHall = await findOrCreateHall({
      name: 'Червона зала',
      rows: 5,
      seatsPerRow: 8,
    });
    const blueHall = await findOrCreateHall({
      name: 'Синя зала',
      rows: 4,
      seatsPerRow: 10,
    });

    const firstShowing = await findOrCreateShowing(
      dune,
      redHall,
      '2027-01-15T18:30:00.000Z',
      12500,
    );
    await findOrCreateShowing(dune, blueHall, '2027-01-16T21:00:00.000Z', 11000);
    await findOrCreateShowing(
      oppenheimer,
      redHall,
      '2027-02-01T19:00:00.000Z',
      13000,
    );
    await findOrCreateShowing(
      oppenheimer,
      blueHall,
      '2027-02-02T20:30:00.000Z',
      12000,
    );

    if (firstShowing.bookings.length === 0) {
      const bookingId = new Types.ObjectId();
      const seats = [
        { row: 1, seat: 1 },
        { row: 1, seat: 2 },
      ];
      await ShowingModel.updateOne(
        {
          _id: firstShowing._id,
          $and: seats.map((s) => ({
            seats: { $elemMatch: { row: s.row, seat: s.seat, bookingId: null } },
          })),
        },
        {
          $set: { 'seats.$[target].bookingId': bookingId },
          $push: {
            bookings: {
              _id: bookingId,
              seats,
              totalPrice: firstShowing.price * seats.length,
              createdAt: new Date(),
            },
          },
        },
        {
          arrayFilters: [
            {
              $or: seats.map((s) => ({
                'target.row': s.row,
                'target.seat': s.seat,
              })),
            },
          ],
        },
      );
    }

    const [films, halls, showings] = await Promise.all([
      FilmModel.countDocuments(),
      HallModel.countDocuments(),
      ShowingModel.countDocuments(),
    ]);
    const bookings = (
      await ShowingModel.aggregate([
        { $project: { count: { $size: '$bookings' } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ])
    )[0]?.total as number | undefined;
    console.log(
      `Seed готово: фільмів ${films}, залів ${halls}, ` +
        `сеансів ${showings}, бронювань ${bookings ?? 0}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Seed помилка:', error);
  process.exit(1);
});
