import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose._mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose._mongooseCache = cache;

const parseNonNegativeInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export default async function connectDB() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI environment variable");
    }

    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: parseNonNegativeInt(process.env.MONGODB_MAX_POOL_SIZE, 20),
      minPoolSize: parseNonNegativeInt(process.env.MONGODB_MIN_POOL_SIZE, 0),
      serverSelectionTimeoutMS: parseNonNegativeInt(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        5000
      ),
      socketTimeoutMS: parseNonNegativeInt(
        process.env.MONGODB_SOCKET_TIMEOUT_MS,
        45000
      ),
      // Auto index creation adds noticeable cold-start latency on large schemas.
      // Keep it opt-in for development via env when needed.
      autoIndex: process.env.MONGOOSE_AUTO_INDEX === "true",
      autoCreate: process.env.MONGOOSE_AUTO_CREATE === "true",
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
