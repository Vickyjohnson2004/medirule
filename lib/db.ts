import mongoose from 'mongoose';

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalCache = globalThis as typeof globalThis & { __mediruleMongoose?: Cache };
const cached = globalCache.__mediruleMongoose ?? { conn: null, promise: null };
globalCache.__mediruleMongoose = cached;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  cached.conn = await cached.promise;
  return cached.conn;
}
