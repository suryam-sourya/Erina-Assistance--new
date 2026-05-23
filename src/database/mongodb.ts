import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise:
    | Promise<typeof mongoose>
    | null;
}

declare global {
  var mongoose:
    | MongooseCache
    | undefined;
}

const cached =
  global.mongoose || {
    conn: null,
    promise: null,
  };

global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise =
      mongoose.connect(
        MONGODB_URI
      );
  }

  cached.conn =
    await cached.promise;

  console.log(
    "✅ MongoDB Connected"
  );

  return cached.conn;
}